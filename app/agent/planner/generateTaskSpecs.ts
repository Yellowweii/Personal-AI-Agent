import type { Message } from "@/agent/types/message";
import type { TaskSpecPlan, ToolCall } from "@/agent/types/plan";

export const generateTaskSpecs = async (
  messages: Message[],
  steps: ToolCall[],
  signal?: AbortSignal,
): Promise<TaskSpecPlan> => {
  const response = await fetch("/api/generateTaskSpecs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, steps }),
    signal,
  });

  if (!response.ok) {
    throw new Error("任务规格生成失败，请稍后重试");
  }

  return response.json();
};
