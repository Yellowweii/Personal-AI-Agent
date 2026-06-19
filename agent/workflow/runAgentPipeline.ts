import type { Message } from "@/agent/types/message";
import type { MessageContentPart } from "@/agent/types/message";
import type { MemoryManager } from "@/agent/memory/memoryManager";
import { runPlanner } from "@/agent/planner/runPlanner";
import { runExecutor } from "@/agent/executor/runExecutor";
import {
  runResponder,
  taskSpecsNeedSummary,
} from "@/agent/responder/runResponder";
import { TOOL_SUMMARY_PART_ID } from "@/constants/responder";
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

  const { taskSpecs } = await runPlanner(memoryManager, signal);

  let entries = createContentEntriesFromTaskSpecs(taskSpecs);
  const needsSummary = taskSpecsNeedSummary(taskSpecs);
  if (needsSummary) {
    entries = [
      ...entries,
      { id: TOOL_SUMMARY_PART_ID, part: { type: "text" } },
    ];
  }
  onContentChange(entriesToContent(entries));

  const hasTextStream =
    needsSummary ||
    taskSpecs.some(
      (spec) => spec.tool === "chat" || spec.tool === "image_understanding",
    );
  if (hasTextStream) {
    await resetTTS?.();
  }

  let pendingContentUpdates: Promise<void> = Promise.resolve();
  const updateEntries = (
    updater: (current: ContentPartEntry[]) => ContentPartEntry[],
  ) => {
    pendingContentUpdates = pendingContentUpdates.then(() => {
      entries = updater(entries);
      onContentChange(entriesToContent(entries));
    });
  };

  const { toolResults } = await runExecutor({
    taskSpecs,
    memoryManager,
    signal,
    callbacks: {
      onPartStart: (partId, loadingLabel) => {
        updateEntries((current) =>
          patchContentEntry(current, partId, { loadingLabel }),
        );
      },
      onPartTextChunk: (partId, chunk) => {
        updateEntries((current) =>
          appendContentEntryText(current, partId, chunk),
        );
        onTextChunk?.(chunk);
      },
      onPartComplete: (partId, patch) => {
        updateEntries((current) =>
          patchContentEntry(current, partId, {
            ...patch,
            loadingLabel: undefined,
          }),
        );
      },
    },
  });

  await pendingContentUpdates;

  await runResponder({
    toolResults,
    memoryManager,
    signal,
    onSummaryChunk: (chunk) => {
      updateEntries((current) =>
        appendContentEntryText(current, TOOL_SUMMARY_PART_ID, chunk),
      );
      onTextChunk?.(chunk);
    },
  });

  await pendingContentUpdates;

  if (hasTextStream) {
    flushTTS?.();
  }
};
