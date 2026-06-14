"use client";

import { toast } from "sonner";
import { TTS_TOGGLE } from "@/constants/textToSpeech";
import {
  AgentLogoIcon,
  ClearSessionIcon,
  TTS_TOGGLE_OFF_ICON,
  TTS_TOGGLE_ON_ICON,
} from "@/svgs/chatHeader";

interface ChatHeaderProps {
  onClear: () => void;
  isTtsEnabled: boolean;
  onToggleTts: () => void;
}

export const ChatHeader = ({
  onClear,
  isTtsEnabled,
  onToggleTts,
}: ChatHeaderProps) => {
  const handleToggleTts = () => {
    const nextEnabled = !isTtsEnabled;
    onToggleTts();
    toast.message(
      nextEnabled ? TTS_TOGGLE.feedbackOn : TTS_TOGGLE.feedbackOff,
    );
  };

  return (
    <header className="flex-none flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <AgentLogoIcon className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-white">
            Personal AI Agent
          </h1>
          <p className="text-xs text-white/40 hidden sm:block">
            理解意图 · 执行任务
          </p>
        </div>
      </div>
      <div
        className="flex items-center gap-1.5 rounded-full border border-white/8 bg-white/2 p-1"
        role="group"
        aria-label="会话控制"
      >
        <button
          type="button"
          onClick={onClear}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 text-xs text-white/60 hover:bg-white/10 hover:text-white/80 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] motion-reduce:transition-none"
          aria-label="重置会话"
          title="重置会话"
        >
          <ClearSessionIcon />
          <span className="hidden sm:inline">重置会话</span>
        </button>
        <button
          type="button"
          onClick={handleToggleTts}
          className={
            isTtsEnabled
              ? "flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-blue-500/25 bg-blue-500/12 text-xs text-blue-300 hover:bg-blue-500/18 hover:text-blue-200 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] motion-reduce:transition-none"
              : "flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/8 bg-white/5 text-xs text-white/35 hover:bg-white/10 hover:text-white/55 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a] motion-reduce:transition-none"
          }
          aria-label={isTtsEnabled ? TTS_TOGGLE.ariaOn : TTS_TOGGLE.ariaOff}
          aria-pressed={isTtsEnabled}
        >
          {isTtsEnabled ? <TTS_TOGGLE_ON_ICON /> : <TTS_TOGGLE_OFF_ICON />}
          <span className="hidden sm:inline">
            {isTtsEnabled ? TTS_TOGGLE.labelOn : TTS_TOGGLE.labelOff}
          </span>
        </button>
      </div>
    </header>
  );
};
