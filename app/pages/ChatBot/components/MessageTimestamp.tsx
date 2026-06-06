"use client";

import { useEffect, useState } from "react";

interface MessageTimestampProps {
  timestamp: Date;
}

export const MessageTimestamp = ({ timestamp }: MessageTimestampProps) => {
  const [formatted, setFormatted] = useState("");

  useEffect(() => {
    setFormatted(
      timestamp.toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
  }, [timestamp]);

  if (!formatted) return null;

  return <> · {formatted}</>;
};
