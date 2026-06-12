import type { Message } from "@/agent/types/message";
import type { Asset, AssetType } from "@/agent/memory/types";
import {
  DEFAULT_IMAGE_ASSET_SUMMARY,
  DEFAULT_VIDEO_ASSET_SUMMARY,
} from "@/constants/memory";
import { getMessageText } from "@/lib/messageContent";

const defaultSummaryForType = (type: AssetType): string => {
  switch (type) {
    case "image":
      return DEFAULT_IMAGE_ASSET_SUMMARY;
    case "video":
      return DEFAULT_VIDEO_ASSET_SUMMARY;
  }
};

export const extractAssetsFromMessage = (message: Message): Asset[] => {
  const assets: Asset[] = [];
  const text = getMessageText(message).trim();

  for (const part of message.content) {
    if (part.type === "image" && part.image_url) {
      assets.push({
        id: crypto.randomUUID(),
        type: "image",
        url: part.image_url,
        summary: text || defaultSummaryForType("image"),
        sourceMessageId: message.id,
      });
    } else if (part.type === "video" && part.video_url) {
      assets.push({
        id: crypto.randomUUID(),
        type: "video",
        url: part.video_url,
        summary: text || defaultSummaryForType("video"),
        sourceMessageId: message.id,
      });
    }
  }

  return assets;
};

export const extractAssetsFromMessages = (messages: Message[]): Asset[] =>
  messages.flatMap((message) => extractAssetsFromMessage(message));
