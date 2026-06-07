import {
  VIDEO_DURATION_SYSTEM_PROMPT,
  VIDEO_PROMPT_SYSTEM_PROMPT,
} from "@/constants/systemPrompts";
import {
  DEFAULT_FRAME_RATE,
  DEFAULT_VIDEO_HEIGHT,
  DEFAULT_VIDEO_MODEL,
  DEFAULT_VIDEO_WIDTH,
  VIDEO_MAX_WAIT_MS,
  VIDEO_POLL_INTERVAL_MS,
} from "@/constants/text2Video";
import type { VideoTaskResponse } from "@/interfaces/text2Video";
import { calcTotalFrames } from "@/utils/calcTotalFrames";

export const maxDuration = 300;

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });

const chatCompletion = async (
  system: string,
  messages: unknown[],
  signal: AbortSignal,
) => {
  const response = await fetch(
    `${process.env.LLM_API_BASE_URL}/v1/chat/completions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.LLM_TEXT_MODEL,
        messages: [{ role: "system", content: system }, ...messages],
      }),
      signal,
    },
  );

  if (!response.ok) {
    throw new Error(`LLM 请求失败: ${response.status}`);
  }

  return (await response.json()).choices[0].message.content as string;
};

const createVideoTask = async (
  prompt: string,
  numFrames: number,
  frameRate: number,
  signal: AbortSignal,
): Promise<string> => {
  const body = {
    model: process.env.LLM_VIDEO_MODEL ?? DEFAULT_VIDEO_MODEL,
    prompt,
    width: Number(process.env.LLM_VIDEO_WIDTH) || DEFAULT_VIDEO_WIDTH,
    height: Number(process.env.LLM_VIDEO_HEIGHT) || DEFAULT_VIDEO_HEIGHT,
    num_frames: numFrames,
    frame_rate: frameRate,
  };

  for (let attempt = 0; attempt < 5; attempt++) {
    const response = await fetch(`${process.env.LLM_API_BASE_URL}/v1/videos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LLM_API_KEY}`,
      },
      body: JSON.stringify(body),
      signal,
    });

    if (response.status === 429 && attempt < 4) {
      await sleep((attempt + 1) * 10_000, signal);
      continue;
    }

    if (!response.ok) {
      throw new Error(`文生视频 API 请求失败: ${response.status}`);
    }

    const data = (await response.json()) as VideoTaskResponse;

    if (!data.video_id) {
      throw new Error("文生视频任务创建失败：缺少 video_id");
    }

    return data.video_id;
  }

  throw new Error("文生视频服务繁忙，请稍后重试");
};

const pollVideoTask = async (
  videoId: string,
  signal: AbortSignal,
): Promise<string> => {
  const startedAt = Date.now();
  const queryUrl = `${process.env.LLM_API_BASE_URL}/agnesapi?video_id=${encodeURIComponent(videoId)}`;

  while (Date.now() - startedAt < VIDEO_MAX_WAIT_MS) {
    const response = await fetch(queryUrl, {
      headers: {
        Authorization: `Bearer ${process.env.LLM_API_KEY}`,
      },
      signal,
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`文生视频状态查询失败: ${response.status} ${detail}`);
    }

    const data = (await response.json()) as VideoTaskResponse;

    if (data.status === "completed") {
      const videoUrl = data.video_url ?? data.remixed_from_video_id;
      if (!videoUrl) {
        throw new Error("视频生成完成但未返回视频地址");
      }
      return videoUrl;
    }

    if (data.status === "failed") {
      throw new Error(data.error ?? "视频生成失败");
    }

    await sleep(VIDEO_POLL_INTERVAL_MS, signal);
  }

  throw new Error("视频生成超时，请稍后重试");
};

export const POST = async (req: Request) => {
  try {
    const { messages } = await req.json();
    const signal = req.signal;

    const frameRate =
      Number(process.env.LLM_VIDEO_FRAME_RATE) || DEFAULT_FRAME_RATE;

    const [videoPrompt, durationRaw] = await Promise.all([
      chatCompletion(VIDEO_PROMPT_SYSTEM_PROMPT, messages, signal),
      chatCompletion(VIDEO_DURATION_SYSTEM_PROMPT, messages, signal),
    ]);

    const numFrames = calcTotalFrames({ durationRaw, frameRate });
    const videoId = await createVideoTask(
      videoPrompt,
      numFrames,
      frameRate,
      signal,
    );
    const videoUrl = await pollVideoTask(videoId, signal);

    return Response.json({ videoUrl });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    const message = error instanceof Error ? error.message : "视频生成失败";
    console.error("text2Video error:", error);
    return Response.json({ error: message }, { status: 500 });
  }
};
