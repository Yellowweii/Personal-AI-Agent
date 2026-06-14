/* eslint-disable @next/next/no-img-element */
import type { Message } from "@/agent/types/message";
import type { MessageContentPart } from "@/agent/types/message";
import { LoadingDots } from "@/views/Agent/components/LoadingIndicator";
import { MessageTimestamp } from "@/views/Agent/components/MessageTimestamp";

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
          <div className="w-fit max-w-full">
            <img
              src={part.image_url}
              alt={isUser ? "用户上传" : "AI 生成"}
              className="block h-[200px] w-auto max-w-none rounded-xl"
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

const isTextBubblePart = (part: MessageContentPart): boolean =>
  part.type === "text" && Boolean(part.text || part.loadingLabel);

const isMediaPart = (part: MessageContentPart): boolean => {
  if (part.type === "image") {
    return Boolean(part.image_url || part.loadingLabel);
  }
  if (part.type === "video") {
    return Boolean(part.video_url || part.loadingLabel);
  }
  return false;
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

  const textBubbleClass = isUser
    ? "inline-flex max-w-full flex-col gap-2 rounded-2xl rounded-tr-sm bg-blue-500 px-4 py-3 text-left text-sm leading-relaxed whitespace-pre-wrap wrap-break-word text-white"
    : "inline-flex max-w-full flex-col gap-2 rounded-2xl rounded-tl-sm bg-white/5 px-4 py-3 text-left text-sm leading-relaxed whitespace-pre-wrap wrap-break-word text-white/90";

  return (
    <div
      className={`max-w-[92%] sm:max-w-[88%] ${isUser ? "ml-auto text-right" : ""}`}
    >
      <div
        className={`flex max-w-full flex-col gap-3 ${isUser ? "items-end" : "items-start"}`}
      >
        {message.content.map((part, index) => {
          if (isMediaPart(part)) {
            return (
              <ContentPartView
                key={`${part.type}-${index}`}
                part={part}
                bottomRef={bottomRef}
                isUser={isUser}
              />
            );
          }

          if (isTextBubblePart(part)) {
            return (
              <div key={`${part.type}-${index}`} className={textBubbleClass}>
                <ContentPartView
                  part={part}
                  bottomRef={bottomRef}
                  isUser={isUser}
                />
              </div>
            );
          }

          return null;
        })}
        {showSharedLoadingDots && (
          <div className={textBubbleClass}>
            <LoadingDots />
          </div>
        )}
      </div>

      <div className="mt-1 text-[10px] text-white/30">
        {isUser ? "你" : "Agent"}
        <MessageTimestamp timestamp={message.timestamp} />
      </div>
    </div>
  );
};
