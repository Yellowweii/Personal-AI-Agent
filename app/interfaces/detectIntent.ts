import type { BuiltContext } from "@/agent/types/memory";

export interface DetectIntentRequest {
  context: BuiltContext;
  hasUserImage: boolean;
}
