"use client";

import { useEffect, useRef, KeyboardEvent, ChangeEvent } from "react";
import {
  MicrophoneIcon,
  StopRecordingIcon,
  TranscribingSpinnerIcon,
} from "@/svgs/speechToText";
import {
  PlusIcon,
  RemoveImageIcon,
  SendIcon,
  UploadProgressRing,
} from "@/svgs/textarea";
import { CHAT_INPUT_PLACEHOLDER } from "@/constants/ui";
import { ALLOWED_IMAGE_TYPES } from "@/constants/uploadImage";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  isLoading: boolean;
  isRecording?: boolean;
  isTranscribing?: boolean;
  isUploading?: boolean;
  uploadProgress?: number;
  pendingImagePreview?: string | null;
  pendingImageUrl?: string | null;
  uploadError?: string | null;
  onImageSelect?: (file: File) => void;
  onImageRemove?: () => void;
  onStartVoice?: () => Promise<void>;
  onStopVoice?: () => void;
  isVoiceSupported?: boolean;
  voiceError?: string | null;
}

export const ChatInput = ({
  value,
  onChange,
  onSubmit,
  onStop,
  isLoading,
  isRecording = false,
  isTranscribing = false,
  isUploading = false,
  uploadProgress = 0,
  pendingImagePreview = null,
  pendingImageUrl = null,
  uploadError = null,
  onImageSelect,
  onImageRemove,
  onStartVoice,
  onStopVoice,
  isVoiceSupported = false,
  voiceError,
}: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    }
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file && onImageSelect) {
      onImageSelect(file);
    }
  };

  const inputDisabled = isLoading || isRecording || isTranscribing;
  const iconBtn =
    "flex items-center justify-center w-8 h-8 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed";
  const canSubmit =
    (value.trim() || pendingImageUrl) &&
    !isLoading &&
    !isRecording &&
    !isTranscribing &&
    !isUploading;

  const placeholder = isRecording
    ? CHAT_INPUT_PLACEHOLDER.recording
    : isTranscribing
      ? CHAT_INPUT_PLACEHOLDER.transcribing
      : CHAT_INPUT_PLACEHOLDER.default;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="relative"
    >
      {pendingImagePreview && (
        <div className="mb-2 flex items-start gap-2">
          <div
            className="relative h-16 w-16 rounded-lg overflow-hidden border border-white/10 bg-white/5"
            aria-busy={isUploading}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pendingImagePreview}
              alt="待发送图片预览"
              className={`h-full w-full object-cover ${isUploading ? "opacity-40" : ""}`}
            />
            {isUploading ? (
              <div
                className="absolute inset-0 flex items-center justify-center bg-black/55"
                aria-live="polite"
                aria-label={`图片上传 ${uploadProgress}%`}
              >
                <UploadProgressRing progress={uploadProgress} size={36} />
              </div>
            ) : (
              <button
                type="button"
                onClick={onImageRemove}
                disabled={inputDisabled || isUploading}
                className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white/80 hover:bg-black/80 disabled:opacity-50"
                aria-label="移除图片"
              >
                <RemoveImageIcon />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="relative flex items-end gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl focus-within:border-white/20 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(",")}
          className="hidden"
          onChange={handleFileChange}
        />
        {!pendingImagePreview && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={inputDisabled || isUploading}
            className={`${iconBtn} shrink-0 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-30`}
            aria-label="添加图片"
          >
            <PlusIcon />
          </button>
        )}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={inputDisabled}
          rows={1}
          className="flex-1 bg-transparent text-sm text-white placeholder-white/30 resize-none outline-none max-h-40 py-1 leading-relaxed disabled:opacity-50"
          style={{ minHeight: "20px" }}
        />
        <div className="flex items-center gap-2 flex-none">
          {isVoiceSupported &&
            !isLoading &&
            (isTranscribing ? (
              <div className={iconBtn} aria-label="正在识别语音">
                <TranscribingSpinnerIcon />
              </div>
            ) : (
              <button
                type="button"
                onClick={isRecording ? onStopVoice : onStartVoice}
                className={
                  isRecording
                    ? `${iconBtn} bg-red-500/20 text-red-400 hover:bg-red-500/30 animate-pulse`
                    : `${iconBtn} bg-white/5 text-white/60 hover:bg-white/10 hover:text-white`
                }
                title={isRecording ? "停止录音" : "语音输入"}
                aria-label={isRecording ? "停止录音" : "开始语音输入"}
              >
                {isRecording ? <StopRecordingIcon /> : <MicrophoneIcon />}
              </button>
            ))}
          {isLoading && (
            <button
              type="button"
              onClick={onStop}
              className={`${iconBtn} bg-red-500/20 text-red-400 hover:bg-red-500/30`}
              title="停止生成"
              aria-label="停止生成"
            >
              <StopRecordingIcon />
            </button>
          )}
          <button
            type="submit"
            disabled={!canSubmit}
            className={`${iconBtn} bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-30`}
            aria-label="提交任务"
          >
            <SendIcon />
          </button>
        </div>
      </div>
      {(voiceError || uploadError) && (
        <p className="text-center text-[10px] text-red-400/80 mt-1">
          {uploadError ?? voiceError}
        </p>
      )}
      <p className="text-center text-[10px] text-white/20 mt-2 hidden sm:block">
        Agent 输出仅供参考，重要决策请自行核实
      </p>
    </form>
  );
};
