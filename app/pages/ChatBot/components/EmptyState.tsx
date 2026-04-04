export const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full pt-16 text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">
        开始一段新的对话
      </h2>
      <p className="text-sm text-white/40 max-w-sm">
        在下方输入你的问题，AI 将实时为你解答，支持多轮对话
      </p>
    </div>
  );
};
