import type { ConversationSummary } from "@/agent/types/memory";

export const getSummary = (
  conversationSummary: ConversationSummary | null,
): string | undefined => conversationSummary?.summary;
