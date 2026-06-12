import type { Message } from "@/agent/types/message";
import type { Asset } from "@/agent/types/memory";
import { summarizeImage } from "@/agent/memory/summary/summarizeImage";
import { DEFAULT_VIDEO_ASSET_SUMMARY } from "@/constants/memory";
import { getMessageText } from "@/lib/messageContent";

export const extractAssetsFromMessage = async (
  message: Message,
  signal?: AbortSignal,
): Promise<Asset[]> => {
  const assets: Asset[] = [];
  const text = getMessageText(message).trim();

  for (const part of message.content) {
    if (part.type === "image" && part.image_url) {
      assets.push({
        id: crypto.randomUUID(),
        type: "image",
        url: part.image_url,
        summary: await summarizeImage(part.image_url, signal),
        sourceMessageId: message.id,
      });
    } else if (part.type === "video" && part.video_url) {
      assets.push({
        id: crypto.randomUUID(),
        type: "video",
        url: part.video_url,
        summary: text || DEFAULT_VIDEO_ASSET_SUMMARY,
        sourceMessageId: message.id,
      });
    }
  }

  return assets;
};
