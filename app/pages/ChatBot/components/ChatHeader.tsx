interface ChatHeaderProps {
  onClear: () => void;
}

export const ChatHeader = ({ onClear }: ChatHeaderProps) => {
  return (
    <header className="flex-none flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-base font-semibold text-white">
            AI Chat
          </h1>
          <p className="text-xs text-white/40 hidden sm:block">
            流式响应 · 多轮对话
          </p>
        </div>
      </div>
      <button
        onClick={onClear}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 text-xs text-white/60 hover:bg-white/10 hover:text-white/80 transition-colors"
        aria-label="清空对话"
      >
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        <span className="hidden sm:inline">清空对话</span>
      </button>
    </header>
  );
};
