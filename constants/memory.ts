/** 每满一批消息即滚动压缩进 summary */
export const SUMMARY_BATCH_SIZE = 20;

/** intent 识别阶段传入 LLM 的最近消息条数上限 */
export const INTENT_CONTEXT_MESSAGE_LIMIT = 5;

export const IMAGE_ASSET_SUMMARY_MAX_LENGTH = 20;

export const IMAGE_ASSET_SUMMARY_PREFIX = "[图片]";

export const VIDEO_ASSET_SUMMARY_PREFIX = "[视频]";

export const DEFAULT_IMAGE_ASSET_SUMMARY = "用户上传了一张图片";

export const DEFAULT_VIDEO_ASSET_SUMMARY = "用户上传了一段视频";
