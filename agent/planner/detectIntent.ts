import type { BuiltContext } from "@/agent/types/memory";
import type { PlanResponse } from "@/agent/types/plan";

export const detectIntent = async (
  context: BuiltContext,
  options: { hasUserImage: boolean; hasUserText: boolean },
  signal?: AbortSignal,
): Promise<PlanResponse> => {
  const response = await fetch("/api/detectIntent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ context, ...options }),
    signal,
  });

  if (!response.ok) {
    throw new Error("任务规划失败，请稍后重试");
  }

  return response.json();
};
