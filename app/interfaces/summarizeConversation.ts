import type { Asset } from "@/agent/memory/types";
import type { Message } from "@/agent/types/message";

export interface SummarizeConversationRequest {
  messages: Message[];
  assets: Asset[];
  previousSummary?: string;
}

export interface SummarizeConversationResponse {
  summary: string;
}
