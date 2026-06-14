import type { TaskSpec } from "@/agent/types/plan";
import type { LlmApiMessage } from "@/lib/messageContent";

export type AssetType = "image" | "video";

export interface Asset {
  id: string;
  type: AssetType;
  url: string;
  summary: string;
  sourceMessageId: string;
}

export interface MemoryFact {
  key: string;
  value: string;
}

export type FormattedMessageContent =
  | string
  | { type: "text"; text: string }[];

export interface ContextMessage {
  role: "user" | "assistant";
  content: FormattedMessageContent;
}

export interface ContextPool {
  currentMessage: ContextMessage | null;
  recentMessages: ContextMessage[];
  summary: string;
  longTermMemories: MemoryFact[];
  assets: Asset[];
}

export interface BuiltContext {
  systemContext: string;
  messages: LlmApiMessage[];
}

export interface ToolContext {
  taskSpec: TaskSpec;
  assets: Asset[];
  currentUserImageUrl?: string;
}
