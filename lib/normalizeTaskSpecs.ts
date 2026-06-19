import {
  IMAGE_ONLY_DEFAULT_PROMPT,
  VALID_TOOL_NAMES,
  type ToolCall,
  type ToolName,
  type TaskSpec,
  type TaskSpecPlan,
} from "@/agent/types/plan";
import { USE_CURRENT_LOCATION_MARKER } from "@/constants/weather";

const DEFAULT_TASK_PROMPT = "请完成该任务。";

const resolveFallbackPrompt = (
  tool: ToolName,
  fallbackPrompt: string,
): string => {
  const trimmed = fallbackPrompt.trim();
  if (trimmed) {
    return trimmed;
  }

  if (tool === "image_understanding") {
    return IMAGE_ONLY_DEFAULT_PROMPT;
  }

  if (tool === "get_location") {
    return "获取用户当前 IP 定位";
  }

  if (tool === "get_weather") {
    return USE_CURRENT_LOCATION_MARKER;
  }

  return DEFAULT_TASK_PROMPT;
};

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
    prompt: resolveFallbackPrompt(step.tool, fallbackPrompt),
    dependsOn: step.dependsOn,
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
    specByTool.set(item.tool, {
      tool: item.tool,
      prompt: item.prompt.trim(),
      dependsOn: [],
    });
  }

  const normalizedSpecs = steps
    .map((step) => {
      const spec = specByTool.get(step.tool);
      if (!spec) return null;

      return { ...spec, dependsOn: step.dependsOn };
    })
    .filter((spec): spec is TaskSpec => Boolean(spec));

  if (normalizedSpecs.length === 0) {
    return buildFallbackTaskSpecs(steps, fallbackPrompt);
  }

  return { taskSpecs: normalizedSpecs };
};
