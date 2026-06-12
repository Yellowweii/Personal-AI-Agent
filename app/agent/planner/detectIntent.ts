import type { BuiltContext } from "@/agent/memory/types";
import type { PlanResponse } from "@/agent/types/plan";

export const detectIntent = async (
  context: BuiltContext,
  hasUserImage: boolean,
  signal?: AbortSignal,
): Promise<PlanResponse> => {
  const response = await fetch("/api/detectIntent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ context, hasUserImage }),
    signal,
  });

  if (!response.ok) {
    throw new Error("任务规划失败，请稍后重试");
  }

  return response.json();
};
