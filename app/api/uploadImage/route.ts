import crypto from "node:crypto";
import {
  ALLOWED_IMAGE_TYPES,
  DEFAULT_QINIU_UPLOAD_HOST,
  MAX_IMAGE_SIZE_BYTES,
  QINIU_BUCKET,
  UPLOAD_ERROR_MESSAGE,
  UPLOAD_INVALID_TYPE_MESSAGE,
  UPLOAD_SIZE_EXCEEDED_MESSAGE,
} from "@/constants/uploadImage";

const urlSafeBase64Encode = (data: string | Buffer): string => {
  const base64 = Buffer.isBuffer(data)
    ? data.toString("base64")
    : Buffer.from(data).toString("base64");

  return base64.replace(/\+/g, "-").replace(/\//g, "_");
};

const createUploadToken = (key: string): string => {
  const accessKey = process.env.QINIU_ACCESS_KEY ?? "";
  const secretKey = process.env.QINIU_SECRET_KEY ?? "";
  const putPolicy = {
    scope: `${QINIU_BUCKET}:${key}`,
    deadline: Math.floor(Date.now() / 1000) + 3600,
  };

  const encodedPutPolicy = urlSafeBase64Encode(JSON.stringify(putPolicy));
  const sign = crypto
    .createHmac("sha1", secretKey)
    .update(encodedPutPolicy)
    .digest();
  const encodedSign = urlSafeBase64Encode(sign);

  return `${accessKey}:${encodedSign}:${encodedPutPolicy}`;
};

const buildPublicUrl = (key: string): string => {
  const baseUrl = process.env.QINIU_CDN_BASE_URL?.replace(/\/$/, "") ?? "";
  return `${baseUrl}/${key}`;
};

const buildObjectKey = (filename: string): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const ext = filename.includes(".")
    ? filename.slice(filename.lastIndexOf(".")).toLowerCase()
    : ".jpg";

  return `${year}/${month}/${crypto.randomUUID()}${ext}`;
};

const uploadToQiniu = async (
  file: Blob,
  key: string,
  filename: string,
): Promise<void> => {
  const uploadHost = process.env.QINIU_UPLOAD_HOST ?? DEFAULT_QINIU_UPLOAD_HOST;
  const token = createUploadToken(key);

  const formData = new FormData();
  formData.append("token", token);
  formData.append("key", key);
  formData.append("file", file, filename);

  const response = await fetch(uploadHost, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`七牛上传失败: ${response.status} ${detail}`);
  }
};

export const POST = async (req: Request) => {
  try {
    const formData = await req.formData();
    const image = formData.get("image");

    if (!image || !(image instanceof Blob)) {
      return Response.json({ error: "未收到图片文件" }, { status: 400 });
    }

    if (
      !ALLOWED_IMAGE_TYPES.includes(
        image.type as (typeof ALLOWED_IMAGE_TYPES)[number],
      )
    ) {
      return Response.json(
        { error: UPLOAD_INVALID_TYPE_MESSAGE },
        { status: 400 },
      );
    }

    if (image.size > MAX_IMAGE_SIZE_BYTES) {
      return Response.json(
        { error: UPLOAD_SIZE_EXCEEDED_MESSAGE },
        { status: 400 },
      );
    }

    const filename =
      image instanceof File && image.name ? image.name : "upload.jpg";
    const key = buildObjectKey(filename);

    await uploadToQiniu(image, key, filename);

    return Response.json({ url: buildPublicUrl(key) });
  } catch (error) {
    console.error("upload error:", error);
    return Response.json({ error: UPLOAD_ERROR_MESSAGE }, { status: 500 });
  }
};
