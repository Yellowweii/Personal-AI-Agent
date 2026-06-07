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
