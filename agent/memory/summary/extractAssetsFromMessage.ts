import type { Message } from "@/agent/types/message";
import type { Asset } from "@/agent/types/memory";
import { summarizeImage } from "@/agent/memory/summary/summarizeImage";
import {
  DEFAULT_IMAGE_ASSET_SUMMARY,
  DEFAULT_VIDEO_ASSET_SUMMARY,
  IMAGE_ASSET_SUMMARY_PREFIX,
  VIDEO_ASSET_SUMMARY_PREFIX,
} from "@/constants/memory";

export const extractAssetsFromMessage = async (
  message: Message,
  signal?: AbortSignal,
): Promise<Asset[]> => {
  const assets: Asset[] = [];

  for (const part of message.content) {
    if (part.type === "image" && part.image_url) {
      let summary = DEFAULT_IMAGE_ASSET_SUMMARY;
      try {
        summary = await summarizeImage(part.image_url, signal);
      } catch (error) {
        console.error("图片 Asset 摘要失败，使用默认值:", error);
      }

      assets.push({
        id: crypto.randomUUID(),
        type: "image",
        url: part.image_url,
        summary: `${IMAGE_ASSET_SUMMARY_PREFIX} ${summary}`,
        sourceMessageId: message.id,
      });
    } else if (part.type === "video" && part.video_url) {
      assets.push({
        id: crypto.randomUUID(),
        type: "video",
        url: part.video_url,
        summary: `${VIDEO_ASSET_SUMMARY_PREFIX} ${DEFAULT_VIDEO_ASSET_SUMMARY}`,
        sourceMessageId: message.id,
      });
    }
  }

  return assets;
};
