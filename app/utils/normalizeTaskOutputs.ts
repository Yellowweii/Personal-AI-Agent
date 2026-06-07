import type { TaskOutputs } from "@/interfaces/chat";

export const DEFAULT_TASK_OUTPUTS: TaskOutputs = {
  text: true,
  image: false,
  video: false,
};

export const normalizeTaskOutputs = (value: unknown): TaskOutputs => {
  let parsed: unknown = value;

  if (typeof value === "string") {
    try {
      const jsonMatch = value.trim().match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return DEFAULT_TASK_OUTPUTS;
      }
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      return DEFAULT_TASK_OUTPUTS;
    }
  }

  if (!parsed || typeof parsed !== "object") {
    return DEFAULT_TASK_OUTPUTS;
  }

  const record = parsed as Record<string, unknown>;
  const outputs: TaskOutputs = {
    text: Boolean(record.text),
    image: Boolean(record.image),
    video: Boolean(record.video),
  };

  if (!outputs.text && !outputs.image && !outputs.video) {
    return DEFAULT_TASK_OUTPUTS;
  }

  return outputs;
};
