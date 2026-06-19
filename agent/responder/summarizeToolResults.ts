import type { ToolResults } from "@/agent/executor/executeTaskSpec";
import { consumeSseStream } from "@/lib/consumeSseStream";

export const summarizeToolResults = async (
  options: {
    userMessage: string;
    toolResults: ToolResults;
    signal?: AbortSignal;
  },
  onChunk: (text: string) => void,
  onDone: () => void,
): Promise<void> => {
  const { userMessage, toolResults, signal } = options;

  const response = await fetch("/api/summarizeToolResults", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userMessage,
      get_location: toolResults.get_location,
      get_weather: toolResults.get_weather,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error("工具结果总结失败，请稍后重试");
  }

  await consumeSseStream(response, onChunk, onDone, signal);
};
