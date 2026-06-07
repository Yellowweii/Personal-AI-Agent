import type { Message } from "@/agent/types/message";
import type { ResponseSlot } from "@/agent/types/responseSlots";
import { detectIntent } from "@/agent/planner/detectIntent";
import { executeTaskSpec } from "@/agent/executor/executeTaskSpec";
import { generateTaskSpecs } from "@/agent/planner/generateTaskSpecs";
import { getMessageImageUrl } from "@/lib/messageContent";
import {
  appendSlotText,
  createSlotsFromTaskSpecs,
  patchSlot,
} from "@/lib/responseSlots";

export interface RunAgentPipelineOptions {
  messages: Message[];
  signal: AbortSignal;
  onSlotsChange: (slots: ResponseSlot[]) => void;
  onTextChunk?: (chunk: string) => void;
  resetTTS?: () => Promise<void>;
  flushTTS?: () => void;
}

export const runAgentPipeline = async (
  options: RunAgentPipelineOptions,
): Promise<void> => {
  const { messages, signal, onSlotsChange, onTextChunk, resetTTS, flushTTS } =
    options;

  const plan = await detectIntent(messages, signal);
  const { taskSpecs } = await generateTaskSpecs(messages, plan.steps, signal);

  const userMsg = [...messages].reverse().find((m) => m.role === "user");
  const imageUrl = userMsg ? getMessageImageUrl(userMsg) : undefined;

  let slots = createSlotsFromTaskSpecs(taskSpecs);
  onSlotsChange(slots);

  const updateSlots = (
    updater: (current: ResponseSlot[]) => ResponseSlot[],
  ) => {
    slots = updater(slots);
    onSlotsChange(slots);
  };

  const hasTextStream = taskSpecs.some(
    (spec) => spec.tool === "chat" || spec.tool === "image_understanding",
  );
  if (hasTextStream) {
    await resetTTS?.();
  }

  await Promise.all(
    taskSpecs.map(async (spec, index) => {
      const slotId = `${spec.tool}-${index}`;
      if (signal.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }

      await executeTaskSpec(
        spec,
        { imageUrl },
        {
          slotId,
          signal,
          onSlotStart: (loadingLabel) => {
            updateSlots((current) =>
              patchSlot(current, slotId, {
                loadingLabel,
                shownAt: Date.now(),
              }),
            );
          },
          onSlotTextChunk: (chunk) => {
            updateSlots((current) => appendSlotText(current, slotId, chunk));
            onTextChunk?.(chunk);
          },
          onSlotComplete: (patch) => {
            updateSlots((current) =>
              patchSlot(current, slotId, {
                ...patch,
                loadingLabel: undefined,
              }),
            );
          },
        },
      );
    }),
  );

  if (hasTextStream) {
    flushTTS?.();
  }
};
