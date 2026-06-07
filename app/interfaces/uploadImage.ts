export interface UploadImageResponse {
  url: string;
}

export type UploadProgressCallback = (progress: number) => void;

export interface UseImageUploadReturn {
  pendingImagePreview: string | null;
  pendingImageUrl: string | null;
  isUploading: boolean;
  uploadProgress: number;
  uploadError: string | null;
  handleImageSelect: (file: File) => Promise<void>;
  clearPendingImage: () => void;
  clearUploadError: () => void;
}
