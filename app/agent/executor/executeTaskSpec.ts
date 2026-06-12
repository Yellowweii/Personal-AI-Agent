import {
  IMAGE_EDIT_PREFIX,
  IMAGE_TO_VIDEO_PREFIX,
  IMAGE_UNDERSTANDING_PREFIX,
  type TaskSpec,
} from "@/agent/types/plan";
import type { Asset } from "@/agent/memory/types";
import { resolveImageUrlForTool } from "@/agent/memory/context/buildToolContext";
import { VIDEO_GENERATING_PREFIX } from "@/constants/text2Video";
import { IMAGE_GENERATING_PREFIX } from "@/constants/ui";
import { imageToTextWithPrompt } from "@/agent/tools/imageToText";
import { textToImageWithPrompt } from "@/agent/tools/textToImage";
import { textToTextWithPrompt } from "@/agent/tools/textToText";
import { textToVideoWithPrompt } from "@/agent/tools/textToVideo";

export interface ExecuteTaskSpecContext {
  imageUrl?: string;
  assets?: Asset[];
}

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
  spec: TaskSpec,
  ctx: ExecuteTaskSpecContext,
  options: ExecuteTaskSpecOptions,
): Promise<void> => {
  const { signal, onPartStart, onPartTextChunk, onPartComplete } = options;

  const resolvedImageUrl = resolveImageUrlForTool(
    ctx.assets ?? [],
    ctx.imageUrl,
  );

  switch (spec.tool) {
    case "image_understanding": {
      if (!resolvedImageUrl) return;

      onPartStart?.(IMAGE_UNDERSTANDING_PREFIX);
      await imageToTextWithPrompt(
        resolvedImageUrl,
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
      onPartStart?.(IMAGE_EDIT_PREFIX);
      const { imageUrl } = await textToImageWithPrompt(spec.prompt, signal);
      onPartComplete?.({ image_url: imageUrl });
      return;
    }

    case "video_generate": {
      onPartStart?.(VIDEO_GENERATING_PREFIX);
      const { videoUrl } = await textToVideoWithPrompt(spec.prompt, signal);
      onPartComplete?.({ video_url: videoUrl });
      return;
    }

    case "image_to_video": {
      onPartStart?.(IMAGE_TO_VIDEO_PREFIX);
      const { videoUrl } = await textToVideoWithPrompt(spec.prompt, signal);
      onPartComplete?.({ video_url: videoUrl });
      return;
    }
  }
};
