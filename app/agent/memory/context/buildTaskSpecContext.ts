import type { BuiltContext, ContextPool } from "@/agent/types/memory";
import { formatContextBlock } from "@/agent/memory/context/formatContextBlock";

export const buildTaskSpecContext = (pool: ContextPool): BuiltContext => ({
  systemContext: formatContextBlock({
    currentMessage: pool.currentMessage,
    recentMessages: pool.recentMessages,
    summary: pool.summary,
    memories: pool.memories,
    assets: pool.assets,
  }),
  userMessage: pool.currentMessage,
});
