/* eslint-disable @next/next/no-img-element */
import type { Message } from "@/agent/types/message";
import type { MessageContentPart } from "@/agent/types/message";
import { LoadingDots } from "@/pages/Agent/components/LoadingIndicator";
import { MessageTimestamp } from "@/pages/Agent/components/MessageTimestamp";
import { AssistantAvatarIcon, UserAvatarIcon } from "@/svgs/chat";

interface MessageBubbleProps {
  message: Message;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  isGenerating?: boolean;
}

interface MediaPlaceholderProps {
  label?: string;
}

interface ContentPartViewProps {
  part: MessageContentPart;
  bottomRef: React.RefObject<HTMLDivElement | null>;
  isUser: boolean;
}

const partHasContentOrLoadingLabel = (part: MessageContentPart): boolean => {
  switch (part.type) {
    case "text":
      return Boolean(part.text || part.loadingLabel);
    case "image":
      return Boolean(part.image_url || part.loadingLabel);
    case "video":
      return Boolean(part.video_url || part.loadingLabel);
  }
};

const ImagePlaceholder = ({ label }: MediaPlaceholderProps) => (
  <div
    className="flex h-[200px] w-full max-w-full shrink-0 items-center justify-center rounded-xl bg-white/10 sm:w-[300px] sm:max-w-[300px]"
    aria-label={label ?? "图片生成中"}
  >
    {label && <span className="text-xs text-white/40">{label}</span>}
  </div>
);

const VideoPlaceholder = ({ label }: MediaPlaceholderProps) => (
  <div
    className="flex h-[225px] w-full max-w-full shrink-0 items-center justify-center rounded-xl bg-white/10 sm:w-[400px] sm:max-w-[400px]"
    aria-label={label ?? "视频生成中"}
  >
    {label && <span className="text-xs text-white/40">{label}</span>}
  </div>
);

const ContentPartView = ({ part, bottomRef, isUser }: ContentPartViewProps) => {
  switch (part.type) {
    case "text":
      if (part.text) {
        return (
          <div className="min-w-0 whitespace-pre-wrap wrap-break-word">
            {part.text}
          </div>
        );
      }
      if (part.loadingLabel) {
        return <div className="min-w-0 text-white/60">{part.loadingLabel}</div>;
      }
      return null;
    case "image":
      if (part.image_url) {
        return (
          <div className="overflow-hidden rounded-xl">
            <img
              src={part.image_url}
              alt={isUser ? "用户上传" : "AI 生成"}
              className={
                isUser
                  ? "max-h-[240px] max-w-full w-auto object-cover sm:max-w-[280px]"
                  : "max-h-[300px] w-auto max-w-full object-cover sm:max-w-[300px]"
              }
              onLoad={() =>
                bottomRef.current?.scrollIntoView({ behavior: "smooth" })
              }
            />
          </div>
        );
      }
      if (isUser || !part.loadingLabel) return null;
      return <ImagePlaceholder label={part.loadingLabel} />;
    case "video":
      if (part.video_url) {
        return (
          <div className="max-w-full shrink-0 overflow-hidden rounded-xl">
            <video
              src={part.video_url}
              controls
              playsInline
              className="max-h-[300px] w-auto max-w-full sm:max-w-[400px]"
              onLoadedData={() =>
                bottomRef.current?.scrollIntoView({ behavior: "smooth" })
              }
            />
          </div>
        );
      }
      if (!part.loadingLabel) return null;
      return <VideoPlaceholder label={part.loadingLabel} />;
  }
};

export const MessageBubble = ({
  message,
  bottomRef,
  isGenerating,
}: MessageBubbleProps) => {
  const isUser = message.role === "user";
  const hasContentOrLoadingLabel = message.content.some(
    partHasContentOrLoadingLabel,
  );
  const showSharedLoadingDots =
    !isUser && isGenerating && !hasContentOrLoadingLabel;

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex-none w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0 ${
          isUser
            ? "bg-blue-500 text-white"
            : "bg-linear-to-br from-purple-500 to-pink-500 text-white"
        }`}
      >
        {isUser ? <UserAvatarIcon /> : <AssistantAvatarIcon />}
      </div>

      <div
        className={`flex-1 max-w-[85%] sm:max-w-[75%] ${isUser ? "text-right" : ""}`}
      >
        <div
          className={`inline-flex max-w-full flex-col gap-3 rounded-2xl px-4 py-3 text-left text-sm leading-relaxed whitespace-pre-wrap wrap-break-word ${
            isUser
              ? "gap-2 rounded-tr-sm bg-blue-500 text-white"
              : "rounded-tl-sm bg-white/5 text-white/90"
          }`}
        >
          {message.content.map((part, index) => (
            <ContentPartView
              key={`${part.type}-${index}`}
              part={part}
              bottomRef={bottomRef}
              isUser={isUser}
            />
          ))}
          {showSharedLoadingDots && <LoadingDots />}
        </div>

        <div className="mt-1 text-[10px] text-white/30">
          {isUser ? "你" : "Agent"}
          <MessageTimestamp timestamp={message.timestamp} />
        </div>
      </div>
    </div>
  );
};
