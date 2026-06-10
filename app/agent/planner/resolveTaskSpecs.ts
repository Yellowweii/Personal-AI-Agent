import type { Message } from "@/agent/types/message";
import type { TaskSpecPlan, ToolCall } from "@/agent/types/plan";
import { generateTaskSpecs } from "@/agent/planner/generateTaskSpecs";
import { getMessageText } from "@/lib/messageContent";
import { buildFallbackTaskSpecs } from "@/lib/normalizeTaskSpecs";

export const resolveTaskSpecs = async (
  messages: Message[],
  steps: ToolCall[],
  signal?: AbortSignal,
): Promise<TaskSpecPlan> => {
  if (steps.length <= 1) {
    const latestUser = [...messages].reverse().find((m) => m.role === "user");
    const fallbackPrompt = latestUser ? getMessageText(latestUser) : "";
    return buildFallbackTaskSpecs(steps, fallbackPrompt);
  }

  return generateTaskSpecs(messages, steps, signal);
};
