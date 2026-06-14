import {
  VALID_TOOL_NAMES,
  type PlanResponse,
  type ToolCall,
  type ToolName,
} from "@/agent/types/plan";

export const DEFAULT_PLAN: PlanResponse = {
  steps: [{ tool: "chat", dependsOn: [] }],
};

const isValidToolName = (value: unknown): value is ToolName =>
  typeof value === "string" &&
  VALID_TOOL_NAMES.includes(value as ToolName);

const parseDependsOn = (value: unknown): ToolName[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((dep): dep is ToolName => isValidToolName(dep));
};

const parseToolCall = (value: unknown): ToolCall | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const { tool, dependsOn } = value as {
    tool?: unknown;
    dependsOn?: unknown;
  };

  if (!isValidToolName(tool)) {
    return null;
  }

  return {
    tool,
    dependsOn: parseDependsOn(dependsOn),
  };
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

  const normalizedSteps = steps
    .map(parseToolCall)
    .filter((step): step is ToolCall => Boolean(step));

  if (normalizedSteps.length === 0) {
    return DEFAULT_PLAN;
  }

  return { steps: normalizedSteps };
};
