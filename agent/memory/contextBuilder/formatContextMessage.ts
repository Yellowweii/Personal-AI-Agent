import type { Asset, ContextMessage } from "@/agent/types/memory";
import type { Message } from "@/agent/types/message";
import { formatMessageWithAssets } from "@/agent/memory/shared/formatMessageWithAssets";

export const formatContextMessage = (
  message: Message,
  assets: Asset[],
): ContextMessage => {
  const content = formatMessageWithAssets(message, assets);

  return {
    role: message.role,
    content: content ?? "",
  };
};
