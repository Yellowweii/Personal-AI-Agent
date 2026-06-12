import type { Message } from "@/agent/types/message";

/** 已压缩进 summary 的消息数量（整批 × SUMMARY_BATCH_SIZE） */
export const getRecentMessages = (
  messages: Message[],
  summarizedCount: number,
): Message[] => messages.slice(summarizedCount);

export const getSummarizedMessageCount = (
  messageCount: number,
  batchSize: number,
): number => Math.floor(messageCount / batchSize) * batchSize;
