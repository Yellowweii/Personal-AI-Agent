export type ToolCall =
  | { tool: "chat" }
  | { tool: "image_understanding" }
  | { tool: "image_generate" }
  | { tool: "image_edit" }
  | { tool: "video_generate" }
  | { tool: "image_to_video" };

export type ToolName = ToolCall["tool"];

export interface PlanResponse {
  steps: ToolCall[];
}

export interface TaskSpec {
  tool: ToolName;
  prompt: string;
}

export interface TaskSpecPlan {
  taskSpecs: TaskSpec[];
}

export const VALID_TOOL_NAMES: ToolName[] = [
  "chat",
  "image_understanding",
  "image_generate",
  "image_edit",
  "video_generate",
  "image_to_video",
];

export const IMAGE_ONLY_DEFAULT_PROMPT = "请描述这张图片的内容。";

export const IMAGE_UNDERSTANDING_PREFIX = "正在理解图片...";

export const IMAGE_EDIT_PREFIX = "正在编辑图片...";

export const IMAGE_TO_VIDEO_PREFIX = "正在将图片转为视频...";
