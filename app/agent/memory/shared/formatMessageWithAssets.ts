import type { Asset, FormattedMessageContent } from "@/agent/types/memory";
import type { Message } from "@/agent/types/message";

const findAssetSummary = (
  assets: Asset[],
  messageId: string,
  url: string,
): string | undefined =>
  assets.find((item) => item.sourceMessageId === messageId && item.url === url)
    ?.summary;

export const formatMessageWithAssets = (
  message: Message,
  assets: Asset[],
): FormattedMessageContent | null => {
  const parts: { type: "text"; text: string }[] = [];

  for (const part of message.content) {
    if (part.type === "text" && part.text?.trim()) {
      parts.push({ type: "text", text: part.text });
    } else if (part.type === "image" && part.image_url) {
      const summary = findAssetSummary(assets, message.id, part.image_url);
      if (summary) {
        parts.push({ type: "text", text: summary });
      }
    } else if (part.type === "video" && part.video_url) {
      const summary = findAssetSummary(assets, message.id, part.video_url);
      if (summary) {
        parts.push({ type: "text", text: summary });
      }
    }
  }

  if (parts.length === 0) {
    return null;
  }

  return parts.length === 1 ? parts[0].text : parts;
};

export const getFormattedMessageText = (
  content: FormattedMessageContent,
): string => {
  if (typeof content === "string") {
    return content;
  }

  return content.map((part) => part.text).join("\n");
};
