import type { Asset } from "@/agent/types/memory";
import type { Message } from "@/agent/types/message";
import type { LlmApiMessage } from "@/lib/messageContent";

export const formatHistoryMessages = (
  messages: Message[],
  assets: Asset[],
): LlmApiMessage[] =>
  messages.flatMap((message) => {
    const parts: { type: "text"; text: string }[] = [];

    for (const part of message.content) {
      if (part.type === "text" && part.text?.trim()) {
        parts.push({ type: "text", text: part.text });
      } else if (part.type === "image" && part.image_url) {
        const asset = assets.find(
          (item) =>
            item.sourceMessageId === message.id && item.url === part.image_url,
        );
        if (asset?.summary) {
          parts.push({ type: "text", text: asset.summary });
        }
      }
    }

    if (parts.length === 0) return [];

    return [
      {
        role: message.role,
        content: parts.length === 1 ? parts[0].text : parts,
      },
    ];
  });
