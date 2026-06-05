/* eslint-disable @next/next/no-img-element */
import type { Message } from "@/interfaces/chat";

interface MessageBubbleProps {
  message: Message;
  bottomRef: React.RefObject<HTMLDivElement | null>;
}

const UserAvatar = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
);

const AssistantAvatar = () => (
  <svg
    className="w-4 h-4"
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
);

export const MessageBubble = ({ message, bottomRef }: MessageBubbleProps) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* 头像 */}
      <div
        className={`flex-none w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0 ${
          isUser
            ? "bg-blue-500 text-white"
            : "bg-linear-to-br from-purple-500 to-pink-500 text-white"
        }`}
      >
        {isUser ? <UserAvatar /> : <AssistantAvatar />}
      </div>

      {/* 消息内容 */}
      <div
        className={`flex-1 max-w-[85%] sm:max-w-[75%] ${isUser ? "text-right" : ""}`}
      >
        {isUser ? (
          <div className="inline-block px-4 py-3 rounded-2xl text-sm leading-relaxed text-left whitespace-pre-wrap wrap-break-word bg-blue-500 text-white rounded-tr-sm">
            {message.content}
          </div>
        ) : (
          <div className="inline-flex max-w-full flex-col gap-3 rounded-2xl px-4 py-3 text-left text-sm leading-relaxed text-white/90 bg-white/5 rounded-tl-sm whitespace-pre-wrap wrap-break-word">
            {message.imagePrefix && (
              <div className="min-w-0 text-white/60">{message.imagePrefix}</div>
            )}
            {message.imageUrl && (
              <div className="rounded-xl overflow-hidden max-w-full shrink-0">
                <img
                  src={message.imageUrl}
                  alt="AI 生成"
                  className="max-w-full sm:max-w-[300px] max-h-[300px] w-auto object-cover"
                  onLoad={() =>
                    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
                  }
                />
              </div>
            )}
            {message.content && (
              <div className="min-w-0">{message.content}</div>
            )}
          </div>
        )}

        <div className="mt-1 text-[10px] text-white/30">
          {isUser ? "你" : "AI"} ·{" "}
          {message.timestamp.toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
};
