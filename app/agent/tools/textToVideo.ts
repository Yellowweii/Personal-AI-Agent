import type { TextToVideoResponse } from "@/interfaces/text2Video";

export const textToVideoWithPrompt = async (
  prompt: string,
  signal?: AbortSignal,
): Promise<TextToVideoResponse> => {
  const response = await fetch("/api/text2Video", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
    signal,
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(data?.error ?? "视频生成失败，请稍后重试");
  }

  return response.json();
};
