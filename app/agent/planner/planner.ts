import type { Message } from "@/agent/types/message";
import type { MessageContentPart } from "@/agent/types/message";
import type { MemoryManager } from "@/agent/memory/memoryManager";
import { detectIntent } from "@/agent/planner/detectIntent";
import { executeTaskSpec } from "@/agent/executor/executeTaskSpec";
import { generateTaskSpecs } from "@/agent/planner/generateTaskSpecs";
import {
  appendContentEntryText,
  createContentEntriesFromTaskSpecs,
  entriesToContent,
  patchContentEntry,
  type ContentPartEntry,
} from "@/lib/messageContent";

export interface RunAgentPipelineOptions {
  messages: Message[];
  memoryManager: MemoryManager;
  signal: AbortSignal;
  onContentChange: (content: MessageContentPart[]) => void;
  onTextChunk?: (chunk: string) => void;
  resetTTS?: () => Promise<void>;
  flushTTS?: () => void;
}

export const runAgentPipeline = async (
  options: RunAgentPipelineOptions,
): Promise<void> => {
  const {
    messages,
    memoryManager,
    signal,
    onContentChange,
    onTextChunk,
    resetTTS,
    flushTTS,
  } = options;

  await memoryManager.syncMessages(messages, signal);

  const intentContext = memoryManager.buildIntentContext();
  const plan = await detectIntent(
    intentContext,
    {
      hasUserImage: memoryManager.latestUserHasImage(),
      hasUserText: memoryManager.latestUserHasText(),
    },
    signal,
  );

  const taskSpecContext = memoryManager.buildTaskSpecContext();
  const { taskSpecs } = await generateTaskSpecs(
    taskSpecContext,
    plan.steps,
    memoryManager.getLatestUserText(),
    signal,
  );

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

      const toolContext = memoryManager.buildToolContext(spec);

      await executeTaskSpec(toolContext, {
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
      });
    }),
  );

  if (hasTextStream) {
    flushTTS?.();
  }
};
