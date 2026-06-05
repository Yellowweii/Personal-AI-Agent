"use client";

import { useState, useCallback, useRef } from "react";
import type { Message, UseChatReturn } from "@/interfaces/chat";
import { detectIntent } from "@/lib/detectIntent";
import { textToText } from "@/lib/textToText";
import { textToImage } from "@/lib/textToImage";
import { CHAT_ERROR_MESSAGE, IMAGE_GENERATING_PREFIX } from "@/constants/ui";

export const useChat = (): UseChatReturn => {
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

      const upsertAssistant = (patch: Partial<Message>) => {
        setMessages((prev) => {
          const exists = prev.find((m) => m.id === assistantId);
          if (exists) {
            return prev.map((m) =>
              m.id === assistantId ? { ...m, ...patch } : m,
            );
          }
          return [
            ...prev,
            {
              id: assistantId,
              role: "assistant" as const,
              content: "",
              timestamp: new Date(),
              ...patch,
            },
          ];
        });
      };

      const onChunk = (text: string) => {
        accumulated += text;
        upsertAssistant({ content: accumulated });
      };

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const intent = await detectIntent(newMessages, controller.signal);

        if (intent === "TEXT") {
          await textToText(
            newMessages,
            onChunk,
            () => setIsLoading(false),
            controller.signal,
          );
        } else if (intent === "MULTIMODAL" || intent === "IMAGE") {
          upsertAssistant({ imagePrefix: IMAGE_GENERATING_PREFIX });

          if (intent === "MULTIMODAL") {
            const bufferedChunks: string[] = [];

            await Promise.all([
              textToText(
                newMessages,
                (chunk) => bufferedChunks.push(chunk),
                () => {},
                controller.signal,
                "multimodal",
              ),
              textToImage(newMessages, controller.signal).then(({ imageUrl }) =>
                upsertAssistant({ imageUrl }),
              ),
            ]);

            accumulated = "";
            for (const chunk of bufferedChunks) {
              accumulated += chunk;
              upsertAssistant({ content: accumulated });
              await new Promise((resolve) => requestAnimationFrame(resolve));
            }
          } else {
            const { imageUrl } = await textToImage(
              newMessages,
              controller.signal,
            );
            upsertAssistant({ imageUrl });
          }
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
            content: CHAT_ERROR_MESSAGE,
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
