import type { BuiltContext } from "@/agent/types/memory";
import type { ToolCall } from "@/agent/types/plan";

export interface GenerateTaskSpecsRequest {
  context: BuiltContext;
  steps: ToolCall[];
  fallbackPrompt: string;
}
