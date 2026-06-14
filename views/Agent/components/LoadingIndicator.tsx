export const LoadingDots = () => (
  <div className="flex items-center gap-1.5">
    <span
      className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce"
      style={{ animationDelay: "0ms" }}
    />
    <span
      className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce"
      style={{ animationDelay: "150ms" }}
    />
    <span
      className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce"
      style={{ animationDelay: "300ms" }}
    />
  </div>
);

export const LoadingIndicator = () => {
  return (
    <div className="flex gap-3">
      <div className="flex-none w-8 h-8 rounded-lg bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
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
      <div className="flex-1">
        <div className="inline-block px-4 py-3 rounded-2xl rounded-tl-sm bg-white/5">
          <LoadingDots />
        </div>
      </div>
    </div>
  );
};
