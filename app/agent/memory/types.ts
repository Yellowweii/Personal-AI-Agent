import type { Message } from "@/agent/types/message";
import type { TaskSpec } from "@/agent/types/plan";

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

export interface ConversationSummary {
  summary: string;
}

export interface ContextPool {
  currentMessage: string;
  recentMessages: Message[];
  summary?: string;
  memories?: MemoryFact[];
  assets?: Asset[];
}

export interface BuiltContext {
  systemContext: string;
  userMessage: string;
}

export interface ToolContext {
  taskSpec: TaskSpec;
  assets: Asset[];
}
