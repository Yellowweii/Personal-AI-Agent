import type { Message } from "@/agent/types/message";
import type { MessageContentPart } from "@/agent/types/message";
import type { TaskSpec, ToolName } from "@/agent/types/plan";

export interface ContentPartEntry {
  id: string;
  part: MessageContentPart;
}

const taskSpecToContentPart = (tool: ToolName): MessageContentPart | null => {
  switch (tool) {
    case "chat":
    case "image_understanding":
      return { type: "text" };
    case "get_location":
    case "get_weather":
      return null;
    case "image_generate":
    case "image_edit":
      return { type: "image" };
    case "video_generate":
    case "image_to_video":
      return { type: "video" };
  }
};

export const buildUserMessageContent = (
  text: string,
  imageUrl?: string,
): MessageContentPart[] => {
  if (!imageUrl) {
    return [{ type: "text", text }];
  }

  const parts: MessageContentPart[] = [{ type: "image", image_url: imageUrl }];

  if (text.trim()) {
    parts.push({ type: "text", text });
  }

  return parts;
};

export const getMessageText = (message: Message): string =>
  message.content
    .filter((part) => part.type === "text")
    .map((part) => part.text ?? "")
    .join("\n");

export const getMessageImageUrl = (message: Message): string | undefined => {
  const part = message.content.find((item) => item.type === "image");
  return part?.image_url;
};

export const hasUserImage = (message: Message): boolean =>
  Boolean(getMessageImageUrl(message));

type LlmContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export type LlmApiMessage = {
  role: "user" | "assistant";
  content: string | LlmContentPart[];
};

export const toLlmApiMessages = (messages: Message[]): LlmApiMessage[] =>
  messages.flatMap((message) => {
    const parts: LlmContentPart[] = [];

    for (const part of message.content) {
      if (part.type === "text" && part.text?.trim()) {
        parts.push({ type: "text", text: part.text });
      } else if (part.type === "image" && part.image_url) {
        parts.push({
          type: "image_url",
          image_url: { url: part.image_url },
        });
      }
    }

    if (parts.length === 0) {
      return [];
    }

    return [
      {
        role: message.role,
        content:
          parts.length === 1 && parts[0].type === "text"
            ? parts[0].text
            : parts,
      },
    ];
  });

export const entriesToContent = (
  entries: ContentPartEntry[],
): MessageContentPart[] => entries.map((entry) => entry.part);

export const createContentEntriesFromTaskSpecs = (
  taskSpecs: TaskSpec[],
): ContentPartEntry[] =>
  taskSpecs.flatMap((spec, index) => {
    const part = taskSpecToContentPart(spec.tool);
    if (!part) return [];

    return [{ id: `${spec.tool}-${index}`, part }];
  });

type ContentPartPatch = {
  loadingLabel?: string;
  text?: string;
  image_url?: string;
  video_url?: string;
};

export const patchContentEntry = (
  entries: ContentPartEntry[],
  partId: string,
  patch: ContentPartPatch,
): ContentPartEntry[] =>
  entries.map((entry) => {
    if (entry.id !== partId) return entry;

    const { part } = entry;
    switch (part.type) {
      case "text":
        return {
          ...entry,
          part: {
            type: "text",
            text: patch.text ?? part.text,
            loadingLabel:
              "loadingLabel" in patch ? patch.loadingLabel : part.loadingLabel,
          },
        };
      case "image":
        return {
          ...entry,
          part: {
            type: "image",
            image_url: patch.image_url ?? part.image_url,
            loadingLabel:
              "loadingLabel" in patch ? patch.loadingLabel : part.loadingLabel,
          },
        };
      case "video":
        return {
          ...entry,
          part: {
            type: "video",
            video_url: patch.video_url ?? part.video_url,
            loadingLabel:
              "loadingLabel" in patch ? patch.loadingLabel : part.loadingLabel,
          },
        };
    }
  });

export const appendContentEntryText = (
  entries: ContentPartEntry[],
  partId: string,
  chunk: string,
): ContentPartEntry[] =>
  entries.map((entry) => {
    if (entry.id !== partId || entry.part.type !== "text") return entry;

    return {
      ...entry,
      part: {
        ...entry.part,
        text: (entry.part.text ?? "") + chunk,
        loadingLabel: undefined,
      },
    };
  });
