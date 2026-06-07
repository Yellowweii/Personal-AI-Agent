import type {
  UploadImageResponse,
  UploadProgressCallback,
} from "@/interfaces/uploadImage";

export const uploadImage = (
  file: File,
  onProgress?: UploadProgressCallback,
): Promise<UploadImageResponse> => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("image", file, file.name);

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText) as UploadImageResponse);
        } catch {
          reject(new Error("图片上传失败，请稍后重试"));
        }
        return;
      }

      try {
        const data = JSON.parse(xhr.responseText) as { error?: string };
        reject(new Error(data.error ?? "图片上传失败，请稍后重试"));
      } catch {
        reject(new Error("图片上传失败，请稍后重试"));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("图片上传失败，请稍后重试"));
    });

    xhr.open("POST", "/api/uploadImage");
    xhr.send(formData);
  });
};
