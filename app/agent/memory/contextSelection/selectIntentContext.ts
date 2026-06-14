import type { BuiltContext, ContextPool } from "@/agent/types/memory";

export const selectIntentContext = (pool: ContextPool): BuiltContext => ({
  systemContext: "",
  messages: pool.currentMessage
    ? [...pool.recentMessages, pool.currentMessage]
    : pool.recentMessages,
});
