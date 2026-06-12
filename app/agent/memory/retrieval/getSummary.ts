import type { ConversationSummary } from "@/agent/memory/types";

export const getSummary = (
  conversationSummary: ConversationSummary | null,
): string | undefined => conversationSummary?.summary;
