import type { Asset } from "@/agent/memory/types";
import type { Message } from "@/agent/types/message";
import type { SummarizeConversationResponse } from "@/interfaces/summarizeConversation";

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

  const { summary } = (await response.json()) as SummarizeConversationResponse;
  return summary;
};
