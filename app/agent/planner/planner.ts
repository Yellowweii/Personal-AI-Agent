import type { Message } from "@/agent/types/message";
import type { MessageContentPart } from "@/agent/types/message";
import { detectIntent } from "@/agent/planner/detectIntent";
import { executeTaskSpec } from "@/agent/executor/executeTaskSpec";
import { resolveTaskSpecs } from "@/agent/planner/resolveTaskSpecs";
import { sortStepsByDisplayOrder } from "@/agent/planner/sortStepsByDisplayOrder";
import {
  appendContentEntryText,
  createContentEntriesFromTaskSpecs,
  entriesToContent,
  getMessageImageUrl,
  patchContentEntry,
  type ContentPartEntry,
} from "@/lib/messageContent";

export interface RunAgentPipelineOptions {
  messages: Message[];
  signal: AbortSignal;
  onContentChange: (content: MessageContentPart[]) => void;
  onTextChunk?: (chunk: string) => void;
  resetTTS?: () => Promise<void>;
  flushTTS?: () => void;
}

export const runAgentPipeline = async (
  options: RunAgentPipelineOptions,
): Promise<void> => {
  const { messages, signal, onContentChange, onTextChunk, resetTTS, flushTTS } =
    options;

  const plan = await detectIntent(messages, signal);
  const steps = sortStepsByDisplayOrder(plan.steps);
  const { taskSpecs } = await resolveTaskSpecs(messages, steps, signal);

  const userMsg = [...messages].reverse().find((m) => m.role === "user");
  const imageUrl = userMsg ? getMessageImageUrl(userMsg) : undefined;

  let entries = createContentEntriesFromTaskSpecs(taskSpecs);
  onContentChange(entriesToContent(entries));

  const updateEntries = (
    updater: (current: ContentPartEntry[]) => ContentPartEntry[],
  ) => {
    entries = updater(entries);
    onContentChange(entriesToContent(entries));
  };

  const hasTextStream = taskSpecs.some(
    (spec) => spec.tool === "chat" || spec.tool === "image_understanding",
  );
  if (hasTextStream) {
    await resetTTS?.();
  }

  await Promise.all(
    taskSpecs.map(async (spec, index) => {
      const partId = `${spec.tool}-${index}`;
      if (signal.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }

      await executeTaskSpec(
        spec,
        { imageUrl },
        {
          partId,
          signal,
          onPartStart: (loadingLabel) => {
            updateEntries((current) =>
              patchContentEntry(current, partId, { loadingLabel }),
            );
          },
          onPartTextChunk: (chunk) => {
            updateEntries((current) =>
              appendContentEntryText(current, partId, chunk),
            );
            onTextChunk?.(chunk);
          },
          onPartComplete: (patch) => {
            updateEntries((current) =>
              patchContentEntry(current, partId, {
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
