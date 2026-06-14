import type { BuiltContext } from "@/agent/types/memory";
import type { TaskSpecPlan, ToolCall } from "@/agent/types/plan";

export const generateTaskSpecs = async (
  context: BuiltContext,
  steps: ToolCall[],
  fallbackPrompt: string,
  signal?: AbortSignal,
): Promise<TaskSpecPlan> => {
  const response = await fetch("/api/generateTaskSpecs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ context, steps, fallbackPrompt }),
    signal,
  });

  if (!response.ok) {
    throw new Error("任务规格生成失败，请稍后重试");
  }

  return response.json();
};
