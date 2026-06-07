"use client";

import { useState, useCallback, useRef } from "react";
import type { Message } from "@/agent/types/message";
import type { ResponseSlot } from "@/agent/types/responseSlots";
import type { UseChatReturn } from "@/interfaces/chat";
import { runAgentPipeline } from "@/agent/planner/planner";
import { CHAT_ERROR_MESSAGE } from "@/constants/ui";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { buildUserMessageContent } from "@/lib/messageContent";

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
    async (content: string, userImageUrl?: string) => {
      if ((!content.trim() && !userImageUrl) || isLoading) return;

      unlockTTS();
      stopTTS();

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: buildUserMessageContent(content, userImageUrl),
        timestamp: new Date(),
      };

      const assistantId = crypto.randomUUID();
      let assistantMsg: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        slots: [],
        timestamp: new Date(),
      };

      const contextMessages: Message[] = [...messages, userMsg];

      setMessages(contextMessages);
      setInput("");
      setIsLoading(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const applySlots = (slots: ResponseSlot[]) => {
        assistantMsg = { ...assistantMsg, slots };
        setMessages([...contextMessages, assistantMsg]);
      };

      try {
        await runAgentPipeline({
          messages: contextMessages,
          signal: controller.signal,
          onSlotsChange: applySlots,
          onTextChunk: feedText,
          resetTTS,
          flushTTS: flush,
        });
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
