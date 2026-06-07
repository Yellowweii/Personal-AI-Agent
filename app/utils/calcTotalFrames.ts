import {
  ALLOWED_NUM_FRAMES,
  DEFAULT_FRAME_RATE,
  DEFAULT_NUM_FRAMES,
} from "@/constants/text2Video";
import type {
  AllowedNumFrames,
  CalcTotalFramesOptions,
} from "@/interfaces/text2Video";

export type { AllowedNumFrames, CalcTotalFramesOptions };

export const parseAllowedNumFrames = (
  value: string | number | undefined | null,
): AllowedNumFrames | null => {
  const parsed = Number(value);
  return ALLOWED_NUM_FRAMES.includes(parsed as AllowedNumFrames)
    ? (parsed as AllowedNumFrames)
    : null;
};

export const getMinVideoSeconds = (frameRate: number): number =>
  ALLOWED_NUM_FRAMES[0] / frameRate;

export const getMaxVideoSeconds = (frameRate: number): number =>
  ALLOWED_NUM_FRAMES[ALLOWED_NUM_FRAMES.length - 1] / frameRate;

export const clampVideoSeconds = (
  seconds: number,
  frameRate: number = DEFAULT_FRAME_RATE,
): number => {
  const minSeconds = getMinVideoSeconds(frameRate);
  const maxSeconds = getMaxVideoSeconds(frameRate);
  return Math.min(maxSeconds, Math.max(minSeconds, seconds));
};

export const secondsToNumFrames = (
  seconds: number,
  frameRate: number = DEFAULT_FRAME_RATE,
): AllowedNumFrames => {
  const targetFrames = clampVideoSeconds(seconds, frameRate) * frameRate;
  return ALLOWED_NUM_FRAMES.reduce((best, current) =>
    Math.abs(current - targetFrames) < Math.abs(best - targetFrames)
      ? current
      : best,
  );
};

export const numFramesToSeconds = (
  numFrames: AllowedNumFrames,
  frameRate: number = DEFAULT_FRAME_RATE,
): number => numFrames / frameRate;

/** 根据 LLM 解析的时长文本（秒数或 DEFAULT）计算合法总帧数 */
export const calcTotalFrames = ({
  durationRaw,
  frameRate = DEFAULT_FRAME_RATE,
  fallbackNumFrames = DEFAULT_NUM_FRAMES,
  envNumFrames = process.env.LLM_VIDEO_NUM_FRAMES,
}: CalcTotalFramesOptions): AllowedNumFrames => {
  const envFrames = parseAllowedNumFrames(envNumFrames);
  const trimmed = durationRaw.trim().toUpperCase();

  if (trimmed === "DEFAULT" || trimmed === "") {
    return envFrames ?? fallbackNumFrames;
  }

  const matched = trimmed.match(/\d+/);
  const seconds = matched ? Number(matched[0]) : Number.NaN;

  if (Number.isNaN(seconds) || seconds <= 0) {
    return envFrames ?? fallbackNumFrames;
  }

  return secondsToNumFrames(seconds, frameRate);
};
