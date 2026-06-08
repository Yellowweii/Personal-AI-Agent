/* eslint-disable @next/next/no-img-element */
import type { Message } from "@/agent/types/message";
import type { ResponseSlot } from "@/agent/types/responseSlots";
import { LoadingDots } from "@/pages/Agent/components/LoadingDots";
import { MessageTimestamp } from "@/pages/Agent/components/MessageTimestamp";
import { AGENT_PENDING_LABEL } from "@/constants/ui";
import { getMessageImageUrl, getMessageText } from "@/lib/messageContent";
import { sortSlotsForDisplay } from "@/lib/responseSlots";

interface MessageBubbleProps {
  message: Message;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  showLoading?: boolean;
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

const AssistantSlot = ({
  slot,
  bottomRef,
}: {
  slot: ResponseSlot;
  bottomRef: React.RefObject<HTMLDivElement | null>;
}) => {
  if (slot.loadingLabel) {
    return <div className="min-w-0 text-white/60">{slot.loadingLabel}</div>;
  }

  switch (slot.kind) {
    case "text":
      return slot.text ? <div className="min-w-0">{slot.text}</div> : null;
    case "image":
      return slot.imageUrl ? (
        <div className="rounded-xl overflow-hidden max-w-full shrink-0">
          <img
            src={slot.imageUrl}
            alt="AI 生成"
            className="max-w-full sm:max-w-[300px] max-h-[300px] w-auto object-cover"
            onLoad={() =>
              bottomRef.current?.scrollIntoView({ behavior: "smooth" })
            }
          />
        </div>
      ) : null;
    case "video":
      return slot.videoUrl ? (
        <div className="rounded-xl overflow-hidden max-w-full shrink-0">
          <video
            src={slot.videoUrl}
            controls
            playsInline
            className="max-w-full sm:max-w-[400px] max-h-[300px] w-auto"
            onLoadedData={() =>
              bottomRef.current?.scrollIntoView({ behavior: "smooth" })
            }
          />
        </div>
      ) : null;
  }
};

export const MessageBubble = ({
  message,
  bottomRef,
  showLoading = false,
}: MessageBubbleProps) => {
  const isUser = message.role === "user";
  const userText = isUser ? getMessageText(message) : "";
  const userImageUrl = isUser ? getMessageImageUrl(message) : undefined;
  const assistantSlots = !isUser
    ? sortSlotsForDisplay(message.slots ?? [])
    : [];
  const showAssistantPending = !isUser && showLoading && assistantSlots.length === 0;

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex-none w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0 ${
          isUser
            ? "bg-blue-500 text-white"
            : "bg-linear-to-br from-purple-500 to-pink-500 text-white"
        }`}
      >
        {isUser ? <UserAvatar /> : <AssistantAvatar />}
      </div>

      <div
        className={`flex-1 max-w-[85%] sm:max-w-[75%] ${isUser ? "text-right" : ""}`}
      >
        {isUser ? (
          <div className="inline-flex max-w-full flex-col gap-2 rounded-2xl rounded-tr-sm bg-blue-500 px-4 py-3 text-left text-sm leading-relaxed text-white">
            {userImageUrl && (
              <div className="overflow-hidden rounded-xl">
                <img
                  src={userImageUrl}
                  alt="用户上传"
                  className="max-h-[240px] max-w-full w-auto object-cover sm:max-w-[280px]"
                  onLoad={() =>
                    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
                  }
                />
              </div>
            )}
            {userText && (
              <div className="min-w-0 whitespace-pre-wrap wrap-break-word">
                {userText}
              </div>
            )}
          </div>
        ) : (
          <div className="inline-flex max-w-full flex-col gap-3 rounded-2xl px-4 py-3 text-left text-sm leading-relaxed text-white/90 bg-white/5 rounded-tl-sm whitespace-pre-wrap wrap-break-word">
            {showAssistantPending ? (
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-white/60">{AGENT_PENDING_LABEL}</span>
                <LoadingDots />
              </div>
            ) : (
              assistantSlots.map((slot) => (
                <AssistantSlot
                  key={slot.id}
                  slot={slot}
                  bottomRef={bottomRef}
                />
              ))
            )}
          </div>
        )}

        <div className="mt-1 text-[10px] text-white/30">
          {isUser ? "你" : "Agent"}
          <MessageTimestamp timestamp={message.timestamp} />
        </div>
      </div>
    </div>
  );
};
