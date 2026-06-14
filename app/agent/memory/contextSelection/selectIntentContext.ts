import type { BuiltContext, ContextPool } from "@/agent/types/memory";
import { INTENT_CONTEXT_MESSAGE_LIMIT } from "@/constants/memory";

export const selectIntentContext = (pool: ContextPool): BuiltContext => ({
  systemContext: "",
  messages: pool.allMessages.slice(-INTENT_CONTEXT_MESSAGE_LIMIT),
});
