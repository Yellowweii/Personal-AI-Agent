import type { Asset } from "@/agent/types/memory";
import type { Message } from "@/agent/types/message";

export interface SummarizeMessagesOptions {
  messages: Message[];
  assets: Asset[];
  previousSummary?: string;
  signal?: AbortSignal;
}

export const summarizeMessages = async (
  options: SummarizeMessagesOptions,
): Promise<string> => {
  const { messages, assets, previousSummary, signal } = options;

  const response = await fetch("/api/summarizeConversation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, assets, previousSummary }),
    signal,
  });

  if (!response.ok) {
    throw new Error("对话摘要生成失败，请稍后重试");
  }

  return (await response.json()) as string;
};
