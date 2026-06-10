import type { ToolCall, ToolName } from "@/agent/types/plan";

const TOOL_DISPLAY_ORDER: Record<ToolName, number> = {
  image_generate: 0,
  image_edit: 0,
  video_generate: 1,
  image_to_video: 1,
  chat: 2,
  image_understanding: 2,
};

export const sortStepsByDisplayOrder = (steps: ToolCall[]): ToolCall[] =>
  [...steps].sort(
    (a, b) => TOOL_DISPLAY_ORDER[a.tool] - TOOL_DISPLAY_ORDER[b.tool],
  );
