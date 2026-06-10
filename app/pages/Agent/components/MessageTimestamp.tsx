interface MessageTimestampProps {
  timestamp: Date;
}

export const MessageTimestamp = ({ timestamp }: MessageTimestampProps) => {
  const formatted = timestamp.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return <> · {formatted}</>;
};
