"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  UPLOAD_INVALID_TYPE_MESSAGE,
  UPLOAD_SIZE_EXCEEDED_MESSAGE,
} from "@/constants/uploadImage";
import type { UseImageUploadReturn } from "@/interfaces/uploadImage";
import { uploadImage } from "@/lib/uploadImage";

export const useImageUpload = (): UseImageUploadReturn => {
  const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(
    null,
  );
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const uploadIdRef = useRef(0);

  useEffect(() => {
    return () => {
      if (pendingImagePreview) {
        URL.revokeObjectURL(pendingImagePreview);
      }
    };
  }, [pendingImagePreview]);

  const clearPendingImage = useCallback(() => {
    uploadIdRef.current += 1;
    setPendingImageUrl(null);
    setIsUploading(false);
    setUploadProgress(0);
    setPendingImagePreview((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return null;
    });
  }, []);

  const clearUploadError = useCallback(() => {
    setUploadError(null);
  }, []);

  const handleImageSelect = useCallback(
    async (file: File) => {
      setUploadError(null);

      if (
        !ALLOWED_IMAGE_TYPES.includes(
          file.type as (typeof ALLOWED_IMAGE_TYPES)[number],
        )
      ) {
        setUploadError(UPLOAD_INVALID_TYPE_MESSAGE);
        return;
      }

      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        setUploadError(UPLOAD_SIZE_EXCEEDED_MESSAGE);
        return;
      }

      clearPendingImage();

      const uploadId = uploadIdRef.current;
      const preview = URL.createObjectURL(file);
      setPendingImagePreview(preview);
      setIsUploading(true);
      setUploadProgress(0);

      try {
        const result = await uploadImage(file, (progress) => {
          if (uploadIdRef.current === uploadId) {
            setUploadProgress(progress);
          }
        });

        if (uploadIdRef.current !== uploadId) {
          return;
        }

        setPendingImageUrl(result.url);
        setUploadProgress(100);
      } catch (error) {
        if (uploadIdRef.current !== uploadId) {
          return;
        }

        setUploadError(
          error instanceof Error ? error.message : "图片上传失败，请稍后重试",
        );
      } finally {
        if (uploadIdRef.current === uploadId) {
          setIsUploading(false);
        }
      }
    },
    [clearPendingImage],
  );

  return {
    pendingImagePreview,
    pendingImageUrl,
    isUploading,
    uploadProgress,
    uploadError,
    handleImageSelect,
    clearPendingImage,
    clearUploadError,
  };
};
