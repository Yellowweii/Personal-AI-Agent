import type { Message, TaskOutputs } from "@/interfaces/chat";
import {
  DEFAULT_TASK_OUTPUTS,
  normalizeTaskOutputs,
} from "@/utils/normalizeTaskOutputs";

export { DEFAULT_TASK_OUTPUTS, normalizeTaskOutputs };

export const detectIntent = async (
  messages: Message[],
  signal?: AbortSignal,
): Promise<TaskOutputs> => {
  const response = await fetch("/api/detectIntent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
    signal,
  });

  if (!response.ok) {
    throw new Error("意图判断失败，请稍后重试");
  }

  const data: { outputs?: TaskOutputs } = await response.json();

  return data.outputs ?? DEFAULT_TASK_OUTPUTS;
};
