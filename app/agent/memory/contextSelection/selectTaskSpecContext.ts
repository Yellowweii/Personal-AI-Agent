import type { BuiltContext, ContextPool } from "@/agent/types/memory";
import { formatSystemContextBlock } from "@/agent/memory/contextSelection/formatContextBlock";

export const selectTaskSpecContext = (pool: ContextPool): BuiltContext => ({
  systemContext: formatSystemContextBlock({
    summary: pool.summary,
    longTermMemories: pool.longTermMemories,
  }),
  messages: pool.currentMessage
    ? [...pool.recentMessages, pool.currentMessage]
    : pool.recentMessages,
});
