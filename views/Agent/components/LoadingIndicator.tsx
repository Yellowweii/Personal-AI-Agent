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
    <div className="max-w-[92%] sm:max-w-[88%]">
      <div className="inline-block rounded-2xl rounded-tl-sm bg-white/5 px-4 py-3">
        <LoadingDots />
      </div>
    </div>
  );
};
