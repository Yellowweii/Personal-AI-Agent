import {
  VALID_TOOL_NAMES,
  type PlanResponse,
  type ToolCall,
} from "@/agent/types/plan";

export const DEFAULT_PLAN: PlanResponse = {
  steps: [{ tool: "chat" }],
};

const isValidToolCall = (value: unknown): value is ToolCall => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const tool = (value as { tool?: unknown }).tool;
  return (
    typeof tool === "string" &&
    VALID_TOOL_NAMES.includes(tool as ToolCall["tool"])
  );
};

export const normalizePlan = (value: unknown): PlanResponse => {
  let parsed: unknown = value;

  if (typeof value === "string") {
    try {
      const jsonMatch = value.trim().match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return DEFAULT_PLAN;
      }
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      return DEFAULT_PLAN;
    }
  }

  if (!parsed || typeof parsed !== "object") {
    return DEFAULT_PLAN;
  }

  const steps = (parsed as { steps?: unknown }).steps;
  if (!Array.isArray(steps)) {
    return DEFAULT_PLAN;
  }

  const normalizedSteps = steps.filter(isValidToolCall);
  if (normalizedSteps.length === 0) {
    return DEFAULT_PLAN;
  }

  return { steps: normalizedSteps };
};
