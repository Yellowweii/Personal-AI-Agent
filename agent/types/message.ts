export type MessageContentPart =
  | { type: "text"; text?: string; loadingLabel?: string }
  | { type: "image"; image_url?: string; loadingLabel?: string }
  | { type: "video"; video_url?: string; loadingLabel?: string };

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: MessageContentPart[];
  timestamp: Date;
}
