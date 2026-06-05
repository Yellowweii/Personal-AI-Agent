"use client";

import { useEffect, useRef, KeyboardEvent, ChangeEvent } from "react";
import {
  MicrophoneIcon,
  StopRecordingIcon,
  TranscribingSpinnerIcon,
} from "@/svgs/audioRecorder";
import { SendIcon } from "@/svgs/chat";
import { CHAT_INPUT_PLACEHOLDER } from "@/constants/ui";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  isLoading: boolean;
  isRecording?: boolean;
  isTranscribing?: boolean;
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
  onStartVoice,
  onStopVoice,
  isVoiceSupported = false,
  voiceError,
}: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const inputDisabled = isLoading || isRecording || isTranscribing;
  const iconBtn =
    "flex items-center justify-center w-8 h-8 rounded-lg transition-colors";
  const canSubmit =
    value.trim() && !isLoading && !isRecording && !isTranscribing;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="relative"
    >
      <div className="relative flex items-end gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl focus-within:border-white/20 transition-colors">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={
            isRecording
              ? CHAT_INPUT_PLACEHOLDER.recording
              : isTranscribing
                ? CHAT_INPUT_PLACEHOLDER.transcribing
                : CHAT_INPUT_PLACEHOLDER.default
          }
          disabled={inputDisabled}
          rows={1}
          className="flex-1 bg-transparent text-sm text-white placeholder-white/30 resize-none outline-none max-h-40 py-1 leading-relaxed disabled:opacity-50"
          style={{ minHeight: "20px" }}
        />
        <div className="flex items-center gap-2 flex-none">
          {isVoiceSupported && !isLoading &&
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
            className={`${iconBtn} bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed`}
            aria-label="发送消息"
          >
            <SendIcon />
          </button>
        </div>
      </div>
      {voiceError && (
        <p className="text-center text-[10px] text-red-400/80 mt-1">
          {voiceError}
        </p>
      )}
      <p className="text-center text-[10px] text-white/20 mt-2 hidden sm:block">
        AI 可能会产生不准确的信息，请谨慎辨别
      </p>
    </form>
  );
};
