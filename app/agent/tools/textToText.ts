import { consumeSseStream } from "@/lib/consumeSseStream";

export const textToTextWithPrompt = async (
  prompt: string,
  onChunk: (text: string) => void,
  onDone: () => void,
  signal?: AbortSignal,
): Promise<void> => {
  const response = await fetch("/api/text2Text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
    signal,
  });

  if (!response.ok) {
    throw new Error("AI 响应失败，请稍后重试");
  }

  await consumeSseStream(response, onChunk, onDone, signal);
};
