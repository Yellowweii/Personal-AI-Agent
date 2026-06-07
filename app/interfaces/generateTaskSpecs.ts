import type { Message } from "@/agent/types/message";
import type { ToolCall } from "@/agent/types/plan";

export interface GenerateTaskSpecsRequest {
  messages: Message[];
  steps: ToolCall[];
}
