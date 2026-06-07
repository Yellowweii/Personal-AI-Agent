"use client";

import { useState, useCallback, useRef } from "react";
import type { Message, UseChatReturn } from "@/interfaces/chat";
import { detectIntent } from "@/lib/detectIntent";
import { textToText } from "@/lib/textToText";
import { textToImage } from "@/lib/textToImage";
import { textToVideo } from "@/lib/textToVideo";
import { CHAT_ERROR_MESSAGE, IMAGE_GENERATING_PREFIX } from "@/constants/ui";
import { VIDEO_GENERATING_PREFIX } from "@/constants/text2Video";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

export const useChat = (): UseChatReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const {
    feedText,
    flush,
    reset: resetTTS,
    stop: stopTTS,
    unlock: unlockTTS,
  } = useTextToSpeech();

  const handleStop = useCallback(() => {
    abortControllerRef.current?.abort();
    stopTTS();
    setIsLoading(false);
  }, [stopTTS]);

  const clearMessages = useCallback(() => {
    stopTTS();
    setMessages([]);
  }, [stopTTS]);

  const handleSend = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      unlockTTS();
      stopTTS();

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
        feedText(text);
      };

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const outputs = await detectIntent(newMessages, controller.signal);
        const hasMedia = outputs.image || outputs.video;

        if (outputs.image) {
          upsertAssistant({ imagePrefix: IMAGE_GENERATING_PREFIX });
        }
        if (outputs.video) {
          upsertAssistant({ videoPrefix: VIDEO_GENERATING_PREFIX });
        }

        if (outputs.text && !hasMedia) {
          await resetTTS();

          await textToText(
            newMessages,
            onChunk,
            () => setIsLoading(false),
            controller.signal,
          );

          flush();
        } else {
          const bufferedChunks: string[] = [];
          const tasks: Promise<void>[] = [];

          if (outputs.text) {
            tasks.push(
              textToText(
                newMessages,
                (chunk) => bufferedChunks.push(chunk),
                () => {},
                controller.signal,
                "multimodal",
              ),
            );
          }

          if (outputs.image) {
            tasks.push(
              textToImage(newMessages, controller.signal).then(({ imageUrl }) =>
                upsertAssistant({ imageUrl }),
              ),
            );
          }

          if (outputs.video) {
            tasks.push(
              textToVideo(newMessages, controller.signal).then(({ videoUrl }) =>
                upsertAssistant({ videoUrl }),
              ),
            );
          }

          await Promise.all(tasks);

          if (outputs.text) {
            await resetTTS();

            accumulated = "";
            for (const chunk of bufferedChunks) {
              accumulated += chunk;
              upsertAssistant({ content: accumulated });
              feedText(chunk);
              await new Promise((resolve) => requestAnimationFrame(resolve));
            }

            flush();
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          stopTTS();
          return;
        }
        stopTTS();
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
    [isLoading, messages, feedText, flush, resetTTS, stopTTS, unlockTTS],
  );

  return {
    messages,
    input,
    isLoading,
    setInput,
    handleSend,
    handleStop,
    stopSpeech: stopTTS,
    clearMessages,
  };
};
