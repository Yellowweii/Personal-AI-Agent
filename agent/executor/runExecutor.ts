import type { MemoryManager } from "@/agent/memory/memoryManager";
import type { TaskSpec } from "@/agent/types/plan";
import {
  executeTaskSpec,
  type ToolResults,
} from "@/agent/executor/executeTaskSpec";
import { batchTaskSpecsByDependency } from "@/lib/batchTaskSpecsByDependency";

export interface RunExecutorCallbacks {
  onPartStart: (partId: string, loadingLabel: string) => void;
  onPartTextChunk: (partId: string, chunk: string) => void;
  onPartComplete: (
    partId: string,
    patch: {
      text?: string;
      image_url?: string;
      video_url?: string;
    },
  ) => void;
}

export interface RunExecutorOptions {
  taskSpecs: TaskSpec[];
  memoryManager: MemoryManager;
  signal: AbortSignal;
  callbacks: RunExecutorCallbacks;
}

export interface RunExecutorResult {
  toolResults: ToolResults;
}

export const runExecutor = async (
  options: RunExecutorOptions,
): Promise<RunExecutorResult> => {
  const { taskSpecs, memoryManager, signal, callbacks } = options;
  const parallelBatches = batchTaskSpecsByDependency(taskSpecs);
  const toolResults: ToolResults = {};

  for (const batch of parallelBatches) {
    if (signal.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }

    await Promise.all(
      batch.map(async (spec) => {
        const index = taskSpecs.indexOf(spec);
        const partId = `${spec.tool}-${index}`;
        const toolContext = memoryManager.buildToolContext(spec);

        await executeTaskSpec(toolContext, {
          partId,
          signal,
          toolResults,
          onPartStart: (loadingLabel) => {
            callbacks.onPartStart(partId, loadingLabel);
          },
          onPartTextChunk: (chunk) => {
            callbacks.onPartTextChunk(partId, chunk);
          },
          onPartComplete: (patch) => {
            callbacks.onPartComplete(partId, patch);
          },
        });
      }),
    );
  }

  return { toolResults };
};
