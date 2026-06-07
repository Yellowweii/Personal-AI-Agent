import type { TextToImageResponse } from "@/interfaces/text2Image";

export const textToImageWithPrompt = async (
  prompt: string,
  signal?: AbortSignal,
): Promise<TextToImageResponse> => {
  const response = await fetch("/api/text2Image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
    signal,
  });

  if (!response.ok) {
    throw new Error("图片生成失败，请稍后重试");
  }

  return response.json();
};
