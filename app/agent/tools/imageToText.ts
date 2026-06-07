import { IMAGE2TEXT_ERROR_MESSAGE } from "@/constants/image2Text";
import { consumeSseStream } from "@/lib/consumeSseStream";

export const imageToTextWithPrompt = async (
  imageUrl: string,
  prompt: string,
  onChunk: (text: string) => void,
  onDone: () => void,
  signal?: AbortSignal,
): Promise<void> => {
  const response = await fetch("/api/image2Text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageUrl, prompt }),
    signal,
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(data?.error ?? IMAGE2TEXT_ERROR_MESSAGE);
  }

  await consumeSseStream(response, onChunk, onDone, signal);
};
