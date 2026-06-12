import type { Asset } from "@/agent/types/memory";
import type { Message } from "@/agent/types/message";

export interface SummarizeConversationRequest {
  messages: Message[];
  assets: Asset[];
  previousSummary?: string;
}
