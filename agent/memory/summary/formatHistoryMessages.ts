import type { Asset } from "@/agent/types/memory";
import type { Message } from "@/agent/types/message";
import type { LlmApiMessage } from "@/lib/messageContent";
import { formatMessageWithAssets } from "@/agent/memory/shared/formatMessageWithAssets";

export const formatHistoryMessages = (
  messages: Message[],
  assets: Asset[],
): LlmApiMessage[] =>
  messages.flatMap((message) => {
    const content = formatMessageWithAssets(message, assets);
    if (!content) {
      return [];
    }

    return [{ role: message.role, content }];
  });
