import type { Message } from "@/agent/types/message";
import type { MessageContentPart } from "@/agent/types/message";

export const buildUserMessageContent = (
  text: string,
  imageUrl?: string,
): MessageContentPart[] => {
  if (!imageUrl) {
    return [{ type: "text", text }];
  }

  const parts: MessageContentPart[] = [];

  if (text.trim()) {
    parts.push({ type: "text", text });
  }

  parts.push({
    type: "image_url",
    image_url: { url: imageUrl },
  });

  return parts;
};

export const getMessageText = (message: Message): string => {
  if (typeof message.content === "string") {
    return message.content;
  }

  return message.content
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n");
};

export const getMessageImageUrl = (message: Message): string | undefined => {
  if (typeof message.content === "string") {
    return undefined;
  }

  return message.content.find((part) => part.type === "image_url")?.image_url
    .url;
};

export const hasUserImage = (message: Message): boolean =>
  Boolean(getMessageImageUrl(message));

export const appendTextPart = (
  content: Message["content"],
  text: string,
): MessageContentPart[] => {
  const parts: MessageContentPart[] = Array.isArray(content)
    ? [...content]
    : [{ type: "text", text: content }];
  parts.push({ type: "text", text });
  return parts;
};
