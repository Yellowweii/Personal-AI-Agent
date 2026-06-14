import { IMAGE2VIDEO_ERROR_MESSAGE } from "@/constants/image2Video";
import type { Image2VideoResponse } from "@/interfaces/image2Video";

export const imageToVideoWithPrompt = async (
  imageUrl: string,
  prompt: string,
  signal?: AbortSignal,
): Promise<Image2VideoResponse> => {
  const response = await fetch("/api/image2Video", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageUrl, prompt }),
    signal,
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(data?.error ?? IMAGE2VIDEO_ERROR_MESSAGE);
  }

  return response.json();
};
