import type { BuiltContext, ContextPool } from "@/agent/memory/types";
import { formatContextBlock } from "@/agent/memory/context/formatContextBlock";

export const buildIntentContext = (pool: ContextPool): BuiltContext => ({
  systemContext: formatContextBlock({
    currentMessage: pool.currentMessage,
    recentMessages: pool.recentMessages,
  }),
  userMessage: pool.currentMessage,
});
