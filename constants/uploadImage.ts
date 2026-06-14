export const QINIU_BUCKET = "personal-ai-agent";

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

export const DEFAULT_QINIU_UPLOAD_HOST = "https://up-z2.qiniup.com";

export const UPLOAD_ERROR_MESSAGE = "图片上传失败，请稍后重试";

export const UPLOAD_INVALID_TYPE_MESSAGE =
  "仅支持 JPG、PNG、GIF、WebP 格式的图片";

export const UPLOAD_SIZE_EXCEEDED_MESSAGE = "图片大小不能超过 10MB";
