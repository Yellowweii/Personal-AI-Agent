import type { Asset, ContextPool, MemoryFact } from "@/agent/types/memory";
import type { Message } from "@/agent/types/message";
import { formatContextMessage } from "@/agent/memory/contextBuilder/formatContextMessage";
import { SUMMARY_BATCH_SIZE } from "@/constants/memory";

export interface BuildContextPoolInput {
  messages: Message[];
  summarizedBatchCount: number;
  conversationSummary: string;
  longTermMemories: MemoryFact[];
  assets: Asset[];
}

export const buildContextPool = (input: BuildContextPoolInput): ContextPool => {
  const {
    messages,
    summarizedBatchCount,
    conversationSummary,
    longTermMemories,
    assets,
  } = input;

  const summarizedCount = summarizedBatchCount * SUMMARY_BATCH_SIZE;
  const latestUserIndex = messages.findLastIndex(
    (message) => message.role === "user",
  );
  const latestUser =
    latestUserIndex >= 0 ? messages[latestUserIndex] : undefined;

  // 未压缩进 summary 的消息，且排除当前用户输入
  const recentRawMessages =
    latestUserIndex >= 0
      ? messages.slice(summarizedCount, latestUserIndex)
      : messages.slice(summarizedCount);

  return {
    currentMessage: latestUser
      ? formatContextMessage(latestUser, assets)
      : null,
    recentMessages: recentRawMessages.map((message) =>
      formatContextMessage(message, assets),
    ),
    summary: conversationSummary,
    longTermMemories,
    assets,
  };
};
