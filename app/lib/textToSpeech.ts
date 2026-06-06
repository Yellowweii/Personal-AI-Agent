import {
  TTS_SENTENCE_ENDINGS,
  TTS_FETCH_ERROR_MESSAGE,
} from "@/constants/textToSpeech";
import type { TextSliceResult } from "@/interfaces/textToSpeech";

const sentenceEndings = new Set(TTS_SENTENCE_ENDINGS);

/** 从缓冲区切出完整句子：遇句末标点切一刀，剩余留待下次 */
export const extractTextSlices = (buffer: string): TextSliceResult => {
  const slices: string[] = [];
  let rest = buffer;

  while (rest.length > 0) {
    let cutIndex = -1;

    for (let i = 0; i < rest.length; i++) {
      if (sentenceEndings.has(rest[i])) {
        cutIndex = i + 1;
        break;
      }
    }

    if (cutIndex === -1) break;

    const slice = rest.slice(0, cutIndex).trim();
    rest = rest.slice(cutIndex);
    if (slice) slices.push(slice);
  }

  return { slices, remainder: rest };
};

export const fetchTextToSpeechStream = async (
  text: string,
  signal?: AbortSignal,
): Promise<ReadableStream<Uint8Array>> => {
  try {
    const response = await fetch("/api/text2Speech", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal,
    });

    if (!response.ok || !response.body) {
      throw new Error(TTS_FETCH_ERROR_MESSAGE);
    }

    return response.body;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }
    throw error instanceof Error
      ? error
      : new Error(TTS_FETCH_ERROR_MESSAGE);
  }
};
