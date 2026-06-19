import type { MemoryManager } from "@/agent/memory/memoryManager";
import { detectIntent } from "@/agent/planner/detectIntent";
import { generateTaskSpecs } from "@/agent/planner/generateTaskSpecs";
import type { TaskSpec } from "@/agent/types/plan";

export interface RunPlannerResult {
  taskSpecs: TaskSpec[];
}

export const runPlanner = async (
  memoryManager: MemoryManager,
  signal: AbortSignal,
): Promise<RunPlannerResult> => {
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

  return { taskSpecs };
};
