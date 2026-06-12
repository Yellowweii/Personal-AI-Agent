import type { Asset, MemoryFact } from "@/agent/memory/types";
import type { Message } from "@/agent/types/message";
import { getMessageText } from "@/lib/messageContent";

const formatRecentMessage = (
  message: Message,
  assets: Asset[],
): Record<string, string> => {
  const text = getMessageText(message).trim();
  const messageAssets = assets.filter(
    (asset) => asset.sourceMessageId === message.id,
  );

  const entry: Record<string, string> = {
    role: message.role,
    content: text || "[非文本消息]",
  };

  if (messageAssets.length > 0) {
    entry.assets = messageAssets
      .map((asset) => `${asset.id}(${asset.type}): ${asset.summary}`)
      .join("; ");
  }

  return entry;
};

export const formatRecentMessagesBlock = (
  messages: Message[],
  assets: Asset[],
): string => {
  if (messages.length === 0) {
    return "（无）";
  }

  const formatted = messages.map((message) =>
    formatRecentMessage(message, assets),
  );
  return JSON.stringify(formatted, null, 2);
};

export const formatAssetsBlock = (assets: Asset[]): string => {
  if (assets.length === 0) {
    return "（无）";
  }

  return JSON.stringify(
    assets.map((asset) => ({
      id: asset.id,
      type: asset.type,
      summary: asset.summary,
      url: asset.url,
    })),
    null,
    2,
  );
};

export const formatMemoriesBlock = (memories: MemoryFact[]): string => {
  if (memories.length === 0) {
    return "（无）";
  }

  return memories.map((memory) => `- ${memory.key}: ${memory.value}`).join("\n");
};

export const formatContextBlock = (sections: {
  currentMessage: string;
  recentMessages?: Message[];
  summary?: string;
  memories?: MemoryFact[];
  assets?: Asset[];
}): string => {
  const parts: string[] = ["# Context", ""];

  parts.push("Current Message:");
  parts.push(sections.currentMessage || "（空）");
  parts.push("");

  if (sections.recentMessages) {
    parts.push("Recent Messages:");
    parts.push(
      formatRecentMessagesBlock(
        sections.recentMessages,
        sections.assets ?? [],
      ),
    );
    parts.push("");
  }

  if (sections.summary) {
    parts.push("Conversation Summary:");
    parts.push(sections.summary);
    parts.push("");
  }

  if (sections.memories) {
    parts.push("Long Term Memory:");
    parts.push(formatMemoriesBlock(sections.memories));
    parts.push("");
  }

  if (sections.assets) {
    parts.push("Assets:");
    parts.push(formatAssetsBlock(sections.assets));
  }

  return parts.join("\n").trim();
};
