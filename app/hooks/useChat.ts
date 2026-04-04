"use client";

import { useState, useCallback, useRef } from "react";
import type { Message } from "@/interfaces/chat";
import { detectIntent } from "@/lib/detectIntent";
import { textToText } from "@/lib/textToText";
import { textToImage } from "@/lib/textToImage";

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleStop = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const handleSend = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: new Date(),
      };

      const newMessages: Message[] = [...messages, userMsg];

      setMessages(newMessages);
      setInput("");
      setIsLoading(true);

      const assistantId = crypto.randomUUID();
      let accumulated = "";

      const onChunk = (text: string) => {
        accumulated += text;
        setMessages((prev) => {
          const exists = prev.find((m) => m.id === assistantId);
          if (exists) {
            return prev.map((m) =>
              m.id === assistantId ? { ...m, content: accumulated } : m,
            );
          } else {
            return [
              ...prev,
              {
                id: assistantId,
                role: "assistant" as const,
                content: accumulated,
                timestamp: new Date(),
              },
            ];
          }
        });
      };

      const onDone = () => {
        setIsLoading(false);
      };

      const onImageReady = (imageUrl: string) => {
        setMessages((prev) => [
          ...prev,
          {
            id: assistantId,
            role: "assistant" as const,
            content: "已根据你的描述生成图片：",
            imageUrl,
            timestamp: new Date(),
          },
        ]);
      };

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const intent = await detectIntent(newMessages, controller.signal);

        if (intent === "TEXT") {
          await textToText(newMessages, onChunk, onDone, controller.signal);
        } else if (intent === "IMAGE") {
          const imageUrl = await textToImage(newMessages, controller.signal);
          onImageReady(imageUrl);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        console.error("API 调用失败:", err);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "抱歉，发生了错误，请稍后重试。",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages],
  );

  return {
    messages,
    input,
    isLoading,
    setInput,
    handleSend,
    handleStop,
    clearMessages,
  };
};
