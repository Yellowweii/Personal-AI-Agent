import type { Message } from "@/agent/types/message";
import type { TaskSpecPlan, ToolCall } from "@/agent/types/plan";
import { generateTaskSpecs } from "@/agent/planner/generateTaskSpecs";

export const resolveTaskSpecs = async (
  messages: Message[],
  steps: ToolCall[],
  signal?: AbortSignal,
): Promise<TaskSpecPlan> => generateTaskSpecs(messages, steps, signal);
