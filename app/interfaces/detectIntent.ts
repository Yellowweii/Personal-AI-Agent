import type { BuiltContext } from "@/agent/memory/types";

export interface DetectIntentRequest {
  context: BuiltContext;
  hasUserImage: boolean;
}
