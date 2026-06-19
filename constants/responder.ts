import type { ToolName } from "@/agent/types/plan";

export const TOOL_SUMMARY_PART_ID = "tool-summary";

/** Planner 规划了这些工具时，Responder 需预留文字输出位 */
export const SUMMARIZABLE_PLAN_TOOLS: ToolName[] = [
  "get_location",
  "get_weather",
];
