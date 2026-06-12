import type { Asset } from "@/agent/memory/types";
import type { Message } from "@/agent/types/message";
import { getMessageText } from "@/lib/messageContent";

export const formatMessagesForSummary = (
  messages: Message[],
  assets: Asset[],
): string =>
  messages
    .map((message) => {
      const text = getMessageText(message).trim();
      const messageAssets = assets.filter(
        (asset) => asset.sourceMessageId === message.id,
      );
      const assetDesc = messageAssets
        .map((asset) => `[${asset.type}: ${asset.summary}]`)
        .join(" ");

      const content = text || "[非文本消息]";
      return assetDesc
        ? `${message.role}: ${content} ${assetDesc}`
        : `${message.role}: ${content}`;
    })
    .join("\n");
