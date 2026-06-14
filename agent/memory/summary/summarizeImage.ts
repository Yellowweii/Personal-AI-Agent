import { IMAGE2TEXT_ERROR_MESSAGE } from "@/constants/image2Text";

export const summarizeImage = async (
  imageUrl: string,
  signal?: AbortSignal,
): Promise<string> => {
  const response = await fetch("/api/summarizeImage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageUrl }),
    signal,
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(data?.error ?? IMAGE2TEXT_ERROR_MESSAGE);
  }

  return response.json();
};
