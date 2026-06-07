import { VALID_TOOL_NAMES } from "@/constants/plan";
import type { ToolCall } from "@/agent/types/plan";
import type { TaskSpec, TaskSpecPlan } from "@/agent/types/plan";

const isValidTaskSpec = (value: unknown): value is TaskSpec => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const { tool, prompt } = value as { tool?: unknown; prompt?: unknown };
  return (
    typeof tool === "string" &&
    VALID_TOOL_NAMES.includes(tool as TaskSpec["tool"]) &&
    typeof prompt === "string" &&
    prompt.trim().length > 0
  );
};

export const buildFallbackTaskSpecs = (
  steps: ToolCall[],
  fallbackPrompt: string,
): TaskSpecPlan => ({
  taskSpecs: steps.map((step) => ({
    tool: step.tool,
    prompt: fallbackPrompt.trim() || "请完成该任务。",
  })),
});

export const normalizeTaskSpecs = (
  value: unknown,
  steps: ToolCall[],
  fallbackPrompt: string,
): TaskSpecPlan => {
  let parsed: unknown = value;

  if (typeof value === "string") {
    try {
      const jsonMatch = value.trim().match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return buildFallbackTaskSpecs(steps, fallbackPrompt);
      }
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      return buildFallbackTaskSpecs(steps, fallbackPrompt);
    }
  }

  if (!parsed || typeof parsed !== "object") {
    return buildFallbackTaskSpecs(steps, fallbackPrompt);
  }

  const taskSpecs = (parsed as { taskSpecs?: unknown }).taskSpecs;
  if (!Array.isArray(taskSpecs)) {
    return buildFallbackTaskSpecs(steps, fallbackPrompt);
  }

  const specByTool = new Map<TaskSpec["tool"], TaskSpec>();
  for (const item of taskSpecs) {
    if (!isValidTaskSpec(item)) continue;
    if (!steps.some((step) => step.tool === item.tool)) continue;
    specByTool.set(item.tool, { tool: item.tool, prompt: item.prompt.trim() });
  }

  const normalizedSpecs = steps
    .map((step) => specByTool.get(step.tool))
    .filter((spec): spec is TaskSpec => Boolean(spec));

  if (normalizedSpecs.length === 0) {
    return buildFallbackTaskSpecs(steps, fallbackPrompt);
  }

  return { taskSpecs: normalizedSpecs };
};
