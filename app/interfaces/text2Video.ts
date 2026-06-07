import type { ALLOWED_NUM_FRAMES } from "@/constants/text2Video";

export type AllowedNumFrames = (typeof ALLOWED_NUM_FRAMES)[number];

export type VideoTaskStatus = "queued" | "in_progress" | "completed" | "failed";

export interface VideoTaskResponse {
  id?: string;
  task_id?: string;
  video_id?: string;
  status: VideoTaskStatus;
  progress?: number;
  video_url?: string;
  remixed_from_video_id?: string;
  error?: string | null;
}

export interface TextToVideoResponse {
  videoUrl: string;
}

export interface TextToVideoErrorResponse {
  error: string;
}

export interface CalcTotalFramesOptions {
  durationRaw: string;
  frameRate?: number;
  fallbackNumFrames?: AllowedNumFrames;
  envNumFrames?: string | number | null;
}
