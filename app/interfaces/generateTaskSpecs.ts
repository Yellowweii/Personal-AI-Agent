import type { BuiltContext } from "@/agent/memory/types";
import type { ToolCall } from "@/agent/types/plan";

export interface GenerateTaskSpecsRequest {
  context: BuiltContext;
  steps: ToolCall[];
}
