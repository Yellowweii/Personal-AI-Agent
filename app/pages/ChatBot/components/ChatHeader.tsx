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
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
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
      <button
        onClick={onClear}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 text-xs text-white/60 hover:bg-white/10 hover:text-white/80 transition-colors"
        aria-label="重置会话"
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
        <span className="hidden sm:inline">重置会话</span>
      </button>
    </header>
  );
};
