import { IMAGE2VIDEO_ERROR_MESSAGE } from "@/constants/image2Video";
import { DEFAULT_VIDEO_MODEL } from "@/constants/text2Video";
import type { Image2VideoRequest } from "@/interfaces/image2Video";
import {
  createVideoTask,
  inferVideoDuration,
  pollVideoTask,
  resolveVideoFrameRate,
} from "@/lib/videoGeneration";
import { calcTotalFrames } from "@/utils/calcTotalFrames";

export const maxDuration = 300;

export const POST = async (req: Request) => {
  try {
    const { imageUrl, prompt } = (await req.json()) as Image2VideoRequest;
    const signal = req.signal;

    const videoPrompt = prompt?.trim();
    if (!videoPrompt) {
      return Response.json({ error: "缺少视频生成 prompt" }, { status: 400 });
    }

    if (!imageUrl?.trim()) {
      return Response.json({ error: "缺少图片 URL" }, { status: 400 });
    }

    const durationRaw = await inferVideoDuration(videoPrompt, signal);
    const numFrames = calcTotalFrames({
      durationRaw,
      frameRate: resolveVideoFrameRate(),
    });
    const videoId = await createVideoTask({
      model:
        process.env.LLM_IMAGE2VIDEO_MODEL ??
        process.env.LLM_TEXT2VIDEO_MODEL ??
        DEFAULT_VIDEO_MODEL,
      prompt: videoPrompt,
      numFrames,
      frameRate: resolveVideoFrameRate(),
      signal,
      imageUrl,
    });
    const videoUrl = await pollVideoTask(videoId, signal);

    return Response.json({ videoUrl });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    const message =
      error instanceof Error ? error.message : IMAGE2VIDEO_ERROR_MESSAGE;
    console.error("image2Video error:", error);
    return Response.json({ error: message }, { status: 500 });
  }
};
