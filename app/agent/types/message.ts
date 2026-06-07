import type { ResponseSlot } from "@/agent/types/responseSlots";

export type MessageContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: MessageContentPart[] | string;
  timestamp: Date;
  imagePrefix?: string;
  imageUrl?: string;
  videoPrefix?: string;
  videoUrl?: string;
  slots?: ResponseSlot[];
}
