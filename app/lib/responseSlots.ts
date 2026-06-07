import type { ToolName } from "@/agent/types/plan";
import type {
  ResponseSlot,
  ResponseSlotKind,
} from "@/agent/types/responseSlots";
import type { TaskSpec } from "@/agent/types/plan";

export const toolToSlotKind = (tool: ToolName): ResponseSlotKind | null => {
  switch (tool) {
    case "chat":
      return "text";
    case "image_generate":
    case "image_edit":
      return "image";
    case "video_generate":
    case "image_to_video":
      return "video";
    case "image_understanding":
      return "text";
  }
};

export const createSlotsFromTaskSpecs = (
  taskSpecs: TaskSpec[],
): ResponseSlot[] =>
  taskSpecs.flatMap((spec, index) => {
    const kind = toolToSlotKind(spec.tool);
    if (!kind) return [];

    return [{ id: `${spec.tool}-${index}`, tool: spec.tool, kind }];
  });

export const patchSlot = (
  slots: ResponseSlot[],
  slotId: string,
  patch: Partial<ResponseSlot>,
): ResponseSlot[] =>
  slots.map((slot) =>
    slot.id === slotId
      ? {
          ...slot,
          ...patch,
          shownAt:
            patch.shownAt ??
            slot.shownAt ??
            (shouldMarkShown(patch) ? Date.now() : slot.shownAt),
        }
      : slot,
  );

const shouldMarkShown = (patch: Partial<ResponseSlot>): boolean =>
  Boolean(patch.loadingLabel || patch.text || patch.imageUrl || patch.videoUrl);

export const appendSlotText = (
  slots: ResponseSlot[],
  slotId: string,
  chunk: string,
): ResponseSlot[] =>
  slots.map((slot) => {
    if (slot.id !== slotId) return slot;

    return {
      ...slot,
      text: (slot.text ?? "") + chunk,
      loadingLabel: undefined,
      shownAt: slot.shownAt ?? Date.now(),
    };
  });

export const sortSlotsForDisplay = (slots: ResponseSlot[]): ResponseSlot[] =>
  [...slots]
    .filter((slot) => slot.shownAt !== undefined)
    .sort((a, b) => (a.shownAt ?? 0) - (b.shownAt ?? 0));
