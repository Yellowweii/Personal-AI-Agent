import { IMAGE2IMAGE_ERROR_MESSAGE } from "@/constants/image2Image";
import type { Image2ImageResponse } from "@/interfaces/image2Image";

export const imageToImageWithPrompt = async (
  imageUrl: string,
  prompt: string,
  signal?: AbortSignal,
): Promise<Image2ImageResponse> => {
  const response = await fetch("/api/image2Image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageUrl, prompt }),
    signal,
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(data?.error ?? IMAGE2IMAGE_ERROR_MESSAGE);
  }

  return response.json();
};
