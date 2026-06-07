import type { ToolName } from "@/agent/types/plan";

export type ResponseSlotKind = "text" | "image" | "video";

export interface ResponseSlot {
  id: string;
  tool: ToolName;
  kind: ResponseSlotKind;
  loadingLabel?: string;
  text?: string;
  imageUrl?: string;
  videoUrl?: string;
  /** 首次展示时间，用于按完成先后排序 */
  shownAt?: number;
}
