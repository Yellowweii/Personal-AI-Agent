import type { ToolName } from "@/agent/types/plan";

export const VALID_TOOL_NAMES: ToolName[] = [
  "chat",
  "image_understanding",
  "image_generate",
  "image_edit",
  "video_generate",
  "image_to_video",
];

export const IMAGE_UNDERSTANDING_PREFIX = "正在理解图片...";

export const IMAGE_EDIT_PREFIX = "正在编辑图片...";

export const IMAGE_TO_VIDEO_PREFIX = "正在将图片转为视频...";
