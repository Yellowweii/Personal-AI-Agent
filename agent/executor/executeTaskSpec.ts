import {
  IMAGE_EDIT_PREFIX,
  IMAGE_TO_VIDEO_PREFIX,
  IMAGE_UNDERSTANDING_PREFIX,
} from "@/agent/types/plan";
import type { ToolContext } from "@/agent/types/memory";
import { resolveImageUrlForTool } from "@/agent/memory/contextSelection/selectToolContext";
import { VIDEO_GENERATING_PREFIX } from "@/constants/text2Video";
import { IMAGE_GENERATING_PREFIX } from "@/constants/ui";
import { imageToImageWithPrompt } from "@/agent/tools/imageToImage";
import { imageToTextWithPrompt } from "@/agent/tools/imageToText";
import { imageToVideoWithPrompt } from "@/agent/tools/imageToVideo";
import { textToImageWithPrompt } from "@/agent/tools/textToImage";
import { textToTextWithPrompt } from "@/agent/tools/textToText";
import { textToVideoWithPrompt } from "@/agent/tools/textToVideo";

export interface ExecuteTaskSpecOptions {
  partId: string;
  signal: AbortSignal;
  onPartStart?: (loadingLabel: string) => void;
  onPartTextChunk?: (chunk: string) => void;
  onPartComplete?: (patch: {
    text?: string;
    image_url?: string;
    video_url?: string;
  }) => void;
}

export const executeTaskSpec = async (
  toolContext: ToolContext,
  options: ExecuteTaskSpecOptions,
): Promise<void> => {
  const { taskSpec: spec, assets, currentUserImageUrl } = toolContext;
  const { signal, onPartStart, onPartTextChunk, onPartComplete } = options;

  switch (spec.tool) {
    case "image_understanding": {
      const imageUrl = resolveImageUrlForTool(assets, currentUserImageUrl);
      if (!imageUrl) return;

      onPartStart?.(IMAGE_UNDERSTANDING_PREFIX);
      await imageToTextWithPrompt(
        imageUrl,
        spec.prompt,
        (chunk) => {
          onPartTextChunk?.(chunk);
        },
        () => {},
        signal,
      );
      return;
    }

    case "chat": {
      await textToTextWithPrompt(
        spec.prompt,
        (chunk) => {
          onPartTextChunk?.(chunk);
        },
        () => {},
        signal,
      );
      return;
    }

    case "image_generate": {
      onPartStart?.(IMAGE_GENERATING_PREFIX);
      const { imageUrl } = await textToImageWithPrompt(spec.prompt, signal);
      onPartComplete?.({ image_url: imageUrl });
      return;
    }

    case "image_edit": {
      const imageUrl = resolveImageUrlForTool(assets, currentUserImageUrl);
      if (!imageUrl) return;

      onPartStart?.(IMAGE_EDIT_PREFIX);
      const { imageUrl: editedImageUrl } = await imageToImageWithPrompt(
        imageUrl,
        spec.prompt,
        signal,
      );
      onPartComplete?.({ image_url: editedImageUrl });
      return;
    }

    case "video_generate": {
      onPartStart?.(VIDEO_GENERATING_PREFIX);
      const { videoUrl } = await textToVideoWithPrompt(spec.prompt, signal);
      onPartComplete?.({ video_url: videoUrl });
      return;
    }

    case "image_to_video": {
      const imageUrl = resolveImageUrlForTool(assets, currentUserImageUrl);
      if (!imageUrl) return;

      onPartStart?.(IMAGE_TO_VIDEO_PREFIX);
      const { videoUrl } = await imageToVideoWithPrompt(
        imageUrl,
        spec.prompt,
        signal,
      );
      onPartComplete?.({ video_url: videoUrl });
      return;
    }
  }
};
