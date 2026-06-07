import {
  IMAGE_EDIT_PREFIX,
  IMAGE_TO_VIDEO_PREFIX,
  IMAGE_UNDERSTANDING_PREFIX,
} from "@/constants/plan";
import { VIDEO_GENERATING_PREFIX } from "@/constants/text2Video";
import { IMAGE_GENERATING_PREFIX } from "@/constants/ui";
import type { TaskSpec } from "@/agent/types/plan";
import { imageToTextWithPrompt } from "@/agent/tools/imageToText";
import { textToImageWithPrompt } from "@/agent/tools/textToImage";
import { textToTextWithPrompt } from "@/agent/tools/textToText";
import { textToVideoWithPrompt } from "@/agent/tools/textToVideo";

export interface ExecuteTaskSpecContext {
  imageUrl?: string;
}

export interface ExecuteTaskSpecOptions {
  slotId: string;
  signal: AbortSignal;
  onSlotStart?: (loadingLabel: string) => void;
  onSlotTextChunk?: (chunk: string) => void;
  onSlotComplete?: (patch: {
    text?: string;
    imageUrl?: string;
    videoUrl?: string;
  }) => void;
}

export const executeTaskSpec = async (
  spec: TaskSpec,
  ctx: ExecuteTaskSpecContext,
  options: ExecuteTaskSpecOptions,
): Promise<void> => {
  const { signal, onSlotStart, onSlotTextChunk, onSlotComplete } = options;

  switch (spec.tool) {
    case "image_understanding": {
      if (!ctx.imageUrl) return;

      onSlotStart?.(IMAGE_UNDERSTANDING_PREFIX);
      await imageToTextWithPrompt(
        ctx.imageUrl,
        spec.prompt,
        (chunk) => {
          onSlotTextChunk?.(chunk);
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
          onSlotTextChunk?.(chunk);
        },
        () => {},
        signal,
      );
      return;
    }

    case "image_generate": {
      onSlotStart?.(IMAGE_GENERATING_PREFIX);
      const { imageUrl } = await textToImageWithPrompt(spec.prompt, signal);
      onSlotComplete?.({ imageUrl });
      return;
    }

    case "image_edit": {
      onSlotStart?.(IMAGE_EDIT_PREFIX);
      const { imageUrl } = await textToImageWithPrompt(spec.prompt, signal);
      onSlotComplete?.({ imageUrl });
      return;
    }

    case "video_generate": {
      onSlotStart?.(VIDEO_GENERATING_PREFIX);
      const { videoUrl } = await textToVideoWithPrompt(spec.prompt, signal);
      onSlotComplete?.({ videoUrl });
      return;
    }

    case "image_to_video": {
      onSlotStart?.(IMAGE_TO_VIDEO_PREFIX);
      const { videoUrl } = await textToVideoWithPrompt(spec.prompt, signal);
      onSlotComplete?.({ videoUrl });
      return;
    }
  }
};
