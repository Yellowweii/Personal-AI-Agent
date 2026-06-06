"use client";

import { useCallback, useRef } from "react";
import {
  TTS_MAX_ATTEMPTS,
  TTS_PLAYBACK_START_DELAY_S,
  TTS_PLAY_CHUNK_BYTES,
  TTS_PREFETCH_BYTES,
  TTS_RETRY_DELAY_MS,
  TTS_SAMPLE_RATE,
  TTS_SILENT_AUDIO_DATA_URL,
  TTS_UNLOCK_PROBE_VOLUME,
} from "@/constants/textToSpeech";
import type { TtsJob, UseTextToSpeechReturn } from "@/interfaces/textToSpeech";
import {
  extractTextSlices,
  fetchTextToSpeechStream,
} from "@/lib/textToSpeech";

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/** 把多个 Uint8Array 拼成一块 */
const concatBytes = (chunks: Uint8Array[]) => {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return merged;
};

/**
 * 流式 TTS Hook：LLM 边出字边按句合成，音频排队无缝播放。
 *
 * 对外 API：
 * - unlock()  用户点击时解锁浏览器自动播放
 * - reset()   新一轮回复开始前初始化
 * - feedText() LLM 每来一块字就喂入
 * - flush()   LLM 结束后刷出剩余未切分的尾巴
 * - stop()    立即停止所有 TTS
 */
export const useTextToSpeech = (): UseTextToSpeechReturn => {
  const abortRef = useRef<AbortController | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const playbackStartedRef = useRef(false);
  const textBufferRef = useRef("");
  const pendingSlicesRef = useRef<string[]>([]);
  const jobQueueRef = useRef<TtsJob[]>([]);
  const pumpingRef = useRef(false);

  /** 关闭 AudioContext 并重置播放时间轴 */
  const closeAudioContext = useCallback(() => {
    if (!audioContextRef.current) return;
    void audioContextRef.current.close().catch(() => {});
    audioContextRef.current = null;
    nextStartTimeRef.current = 0;
    playbackStartedRef.current = false;
  }, []);

  /** 停止本轮所有 TTS：中断请求、清空队列、关闭播放器 */
  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    textBufferRef.current = "";
    pendingSlicesRef.current = [];
    jobQueueRef.current = [];
    pumpingRef.current = false;
    closeAudioContext();
  }, [closeAudioContext]);

  /** 在用户点击时播放静音，绕过浏览器 autoplay 限制 */
  const unlock = useCallback(() => {
    const probe = new Audio(TTS_SILENT_AUDIO_DATA_URL);
    probe.volume = TTS_UNLOCK_PROBE_VOLUME;
    void probe.play().catch(() => {});
  }, []);

  /** 创建或唤醒 AudioContext，供后续排程 PCM 使用 */
  const ensureAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      nextStartTimeRef.current = 0;
      playbackStartedRef.current = false;
    }
    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  /** 把一块 PCM 转成 AudioBuffer 并排到播放时间轴上 */
  const schedulePCM = useCallback((pcmData: Uint8Array, ctx: AudioContext) => {
    if (pcmData.byteLength < 2) return;

    const copy = pcmData.slice();
    const int16 = new Int16Array(
      copy.buffer,
      copy.byteOffset,
      copy.byteLength / 2,
    );
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768;
    }

    const audioBuffer = ctx.createBuffer(1, float32.length, TTS_SAMPLE_RATE);
    audioBuffer.copyToChannel(float32, 0);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);

    const startTime = Math.max(ctx.currentTime, nextStartTimeRef.current);
    source.start(startTime);
    nextStartTimeRef.current = startTime + audioBuffer.duration;
  }, []);

  /**
   * 消费一句 TTS 的音频流：边下边缓冲，预攒够再排程，流结束后刷尾巴。
   * 只负责「排进播放队列」，不等待实际播完。
   */
  const schedulePCMStream = useCallback(
    async (stream: ReadableStream<Uint8Array>, signal: AbortSignal) => {
      const ctx = await ensureAudioContext();
      const reader = stream.getReader();
      const queue: Uint8Array[] = [];
      let queueBytes = 0;
      let oddByte: number | null = null;
      let streamEnded = false;

      /** 写入网络 chunk，处理 16bit 对齐（奇数字节暂存） */
      const pushChunk = (chunk: Uint8Array) => {
        let data = chunk;

        if (oddByte !== null) {
          const merged = new Uint8Array(data.length + 1);
          merged[0] = oddByte;
          merged.set(data, 1);
          data = merged;
          oddByte = null;
        }

        if (data.length % 2 === 1) {
          oddByte = data[data.length - 1];
          data = data.slice(0, -1);
        }

        if (data.length === 0) return;

        queue.push(data);
        queueBytes += data.length;
      };

      /** 从缓冲队列取出指定字节数的 PCM */
      const takeBytes = (size: number) => {
        const parts: Uint8Array[] = [];
        let collected = 0;

        while (queue.length > 0 && collected < size) {
          const chunk = queue[0];
          const needed = size - collected;

          if (chunk.length <= needed) {
            parts.push(queue.shift()!);
            collected += chunk.length;
            queueBytes -= chunk.length;
            continue;
          }

          parts.push(chunk.slice(0, needed));
          queue[0] = chunk.slice(needed);
          collected += needed;
          queueBytes -= needed;
        }

        return collected >= 2 ? concatBytes(parts) : null;
      };

      /** 预缓冲达标后开始/继续往 Web Audio 排程 */
      const flushPlayback = () => {
        if (!playbackStartedRef.current) {
          if (!streamEnded && queueBytes < TTS_PREFETCH_BYTES) return;
          playbackStartedRef.current = true;
          if (nextStartTimeRef.current === 0) {
            nextStartTimeRef.current =
              ctx.currentTime + TTS_PLAYBACK_START_DELAY_S;
          }
        }

        while (queueBytes >= TTS_PLAY_CHUNK_BYTES) {
          const chunk = takeBytes(TTS_PLAY_CHUNK_BYTES);
          if (!chunk) break;
          schedulePCM(chunk, ctx);
        }

        if (streamEnded && queueBytes >= 2) {
          const tail = takeBytes(queueBytes);
          if (tail) schedulePCM(tail, ctx);
        }
      };

      try {
        while (!signal.aborted) {
          const { done, value } = await reader.read();
          if (done) {
            streamEnded = true;
            break;
          }
          if (value.byteLength > 0) {
            pushChunk(value);
          }
          flushPlayback();
        }

        streamEnded = true;
        flushPlayback();
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          throw error;
        }
        throw error instanceof Error
          ? error
          : new Error("TTS 音频流读取失败");
      } finally {
        reader.releaseLock();
      }
    },
    [ensureAudioContext, schedulePCM],
  );

  /** 拉取音频并播放单句，失败时按 TTS_MAX_ATTEMPTS 重试 */
  const playSliceWithRetry = useCallback(
    async (text: string, signal: AbortSignal) => {
      let lastError: unknown;

      for (let attempt = 1; attempt <= TTS_MAX_ATTEMPTS; attempt++) {
        try {
          if (attempt > 1) {
            await sleep(TTS_RETRY_DELAY_MS);
            console.warn(`TTS 重试 (${attempt}/${TTS_MAX_ATTEMPTS})`);
          }

          const stream = await fetchTextToSpeechStream(text, signal);
          if (signal.aborted) return;

          await schedulePCMStream(stream, signal);
          return;
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") {
            throw error;
          }
          if (signal.aborted) return;

          lastError = error;
        }
      }

      console.error("TTS 播放失败，已跳过该句:", lastError);
    },
    [schedulePCMStream],
  );

  /** 按顺序处理 jobQueue：取任务 → 请求音频 → 排程播放（含重试） */
  const pumpJobs = useCallback(async () => {
    if (pumpingRef.current) return;
    pumpingRef.current = true;

    const signal = abortRef.current?.signal;
    if (!signal) {
      pumpingRef.current = false;
      return;
    }

    try {
      while (jobQueueRef.current.length > 0 && !signal.aborted) {
        const job = jobQueueRef.current.shift()!;
        try {
          await playSliceWithRetry(job.text, signal);
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") break;
        }
      }
    } finally {
      pumpingRef.current = false;
      if (jobQueueRef.current.length > 0 && !signal.aborted) {
        void pumpJobs();
      }
    }
  }, [playSliceWithRetry]);

  /** 把切分好的句子加入队列，并立即发起 TTS 请求（预取） */
  const enqueueSlices = useCallback(
    (slices: string[]) => {
      const signal = abortRef.current?.signal;
      if (!signal || slices.length === 0) return;

      for (const slice of slices) {
        jobQueueRef.current.push({ text: slice });
      }

      void pumpJobs();
    },
    [pumpJobs],
  );

  /** 把 reset 之前暂存的句子补进队列 */
  const pushPendingSlices = useCallback(() => {
    if (pendingSlicesRef.current.length === 0) return;
    enqueueSlices(pendingSlicesRef.current);
    pendingSlicesRef.current = [];
  }, [enqueueSlices]);

  /** 新一轮回复开始：停掉旧的 → 新建取消令牌 → 准备播放器 */
  const reset = useCallback(async () => {
    stop();

    const abortController = new AbortController();
    abortRef.current = abortController;

    await ensureAudioContext();
    pushPendingSlices();
  }, [ensureAudioContext, pushPendingSlices, stop]);

  /** LLM 流式输出的每个 chunk：累积 → 按句切分 → 完整句入队 TTS */
  const feedText = useCallback(
    (delta: string) => {
      if (!delta) return;

      textBufferRef.current += delta;
      const { slices, remainder } = extractTextSlices(textBufferRef.current);
      textBufferRef.current = remainder;

      if (!abortRef.current) {
        if (slices.length > 0) {
          pendingSlicesRef.current.push(...slices);
        }
        return;
      }

      if (slices.length > 0) {
        enqueueSlices(slices);
      }
    },
    [enqueueSlices],
  );

  /** LLM 结束后，把缓冲区里凑不齐一句的尾巴也送去 TTS */
  const flush = useCallback(() => {
    if (textBufferRef.current.trim()) {
      const tail = textBufferRef.current.trim();
      textBufferRef.current = "";
      if (abortRef.current) {
        enqueueSlices([tail]);
      } else {
        pendingSlicesRef.current.push(tail);
      }
    }
  }, [enqueueSlices]);

  return { feedText, flush, reset, stop, unlock };
};
