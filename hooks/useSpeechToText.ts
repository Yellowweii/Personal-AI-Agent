"use client";

import type {
  SpeechToTextStatus,
  UseSpeechToTextReturn,
} from "@/interfaces/speechToText";
import { useState, useCallback, useRef, useSyncExternalStore } from "react";

const checkMediaRecorderSupport = (): boolean => {
  if (typeof window === "undefined") return false;
  return !!(
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === "function" &&
    typeof MediaRecorder !== "undefined"
  );
};

const getSupportedMimeType = (): string | undefined => {
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  return types.find((type) => MediaRecorder.isTypeSupported(type));
};

export const useSpeechToText = (): UseSpeechToTextReturn => {
  const [status, setStatus] = useState<SpeechToTextStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioBlobRef = useRef<Blob | null>(null);
  const mimeTypeRef = useRef<string>("audio/webm");
  const stopResolveRef = useRef<((blob: Blob | null) => void) | null>(null);

  const isSupported = useSyncExternalStore(
    () => () => {},
    checkMediaRecorderSupport,
    () => false,
  );

  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
  }, []);

  const startListening = useCallback(async () => {
    if (!isSupported) {
      setError("当前浏览器不支持录音功能");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;
      audioChunksRef.current = [];
      audioBlobRef.current = null;
      setError(null);

      const mimeType = getSupportedMimeType();
      mimeTypeRef.current = mimeType ?? "audio/webm";

      const mediaRecorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );

      mediaRecorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mimeTypeRef.current,
        });
        audioBlobRef.current = audioBlob;
        setStatus("idle");
        stopResolveRef.current?.(audioBlob);
        stopResolveRef.current = null;
      };

      mediaRecorder.onerror = (e: Event) => {
        console.error("录音错误:", e);
        setError("录音过程发生错误");
        setStatus("error");
        cleanup();
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100);
      setStatus("recording");
    } catch (err) {
      console.error("无法获取麦克风权限:", err);

      if (err instanceof DOMException) {
        if (err.name === "NotAllowedError") {
          setError("请允许麦克风权限");
        } else if (err.name === "NotFoundError") {
          setError("未找到麦克风设备");
        } else {
          setError("无法访问麦克风");
        }
      } else {
        setError("录音初始化失败");
      }

      setStatus("error");
    }
  }, [isSupported, cleanup]);

  const stopListening = useCallback((): Promise<Blob | null> => {
    if (
      !mediaRecorderRef.current ||
      mediaRecorderRef.current.state === "inactive"
    ) {
      return Promise.resolve(audioBlobRef.current);
    }

    return new Promise((resolve) => {
      stopResolveRef.current = resolve;
      mediaRecorderRef.current!.stop();
      setStatus("processing");

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    });
  }, []);

  const getCapturedAudio = useCallback((): Blob | null => {
    return audioBlobRef.current;
  }, []);

  return {
    status,
    error,
    isSupported,
    startListening,
    stopListening,
    getCapturedAudio,
  };
};
