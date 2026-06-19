import type { MemoryManager } from "@/agent/memory/memoryManager";
import type { ToolResults } from "@/agent/executor/executeTaskSpec";
import type { TaskSpec } from "@/agent/types/plan";
import { summarizeToolResults } from "@/agent/responder/summarizeToolResults";
import { SUMMARIZABLE_PLAN_TOOLS } from "@/constants/responder";

export const taskSpecsNeedSummary = (taskSpecs: TaskSpec[]): boolean =>
  taskSpecs.some((spec) => SUMMARIZABLE_PLAN_TOOLS.includes(spec.tool));

export const shouldSummarizeToolResults = (
  toolResults: ToolResults,
): boolean =>
  Boolean(toolResults.get_weather || toolResults.get_location);

export interface RunResponderOptions {
  toolResults: ToolResults;
  memoryManager: MemoryManager;
  signal: AbortSignal;
  onSummaryChunk: (chunk: string) => void;
}

export const runResponder = async (
  options: RunResponderOptions,
): Promise<void> => {
  const { toolResults, memoryManager, signal, onSummaryChunk } = options;

  if (!shouldSummarizeToolResults(toolResults)) {
    return;
  }

  await summarizeToolResults(
    {
      userMessage: memoryManager.getLatestUserText(),
      toolResults,
      signal,
    },
    onSummaryChunk,
    () => {},
  );
};
