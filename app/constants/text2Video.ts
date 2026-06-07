export const ALLOWED_NUM_FRAMES = [81, 121, 161, 241, 441] as const;

export const DEFAULT_NUM_FRAMES = ALLOWED_NUM_FRAMES[1];
export const DEFAULT_FRAME_RATE = 24;

export const DEFAULT_VIDEO_MODEL = "agnes-video-v2.0";
export const DEFAULT_VIDEO_WIDTH = 1152;
export const DEFAULT_VIDEO_HEIGHT = 768;

export const VIDEO_POLL_INTERVAL_MS = 10_000;
export const VIDEO_MAX_DURATION_S = 300;
export const VIDEO_MAX_WAIT_MS = VIDEO_MAX_DURATION_S * 1000;

export const VIDEO_GENERATING_PREFIX =
  "正在为您生成视频，预计需要数分钟，请耐心等待...";
