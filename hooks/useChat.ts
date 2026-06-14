"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { Message } from "@/agent/types/message";
import type { MessageContentPart } from "@/agent/types/message";
import type { UseChatReturn } from "@/interfaces/chat";
import { MemoryManager } from "@/agent/memory/memoryManager";
import { runAgentPipeline } from "@/agent/planner/planner";
import { CHAT_ERROR_MESSAGE } from "@/constants/ui";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useTtsEnabled } from "@/hooks/useTtsEnabled";
import { buildUserMessageContent } from "@/lib/messageContent";

export const useChat = (): UseChatReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const memoryManagerRef = useRef(new MemoryManager());
  const { isTtsEnabled, toggleTtsEnabled } = useTtsEnabled();
  const {
    feedText,
    flush,
    reset: resetTTS,
    stop: stopTTS,
    unlock: unlockTTS,
  } = useTextToSpeech({ enabled: isTtsEnabled });

  useEffect(() => {
    if (!isTtsEnabled) {
      stopTTS();
    }
  }, [isTtsEnabled, stopTTS]);

  const handleStop = useCallback(() => {
    abortControllerRef.current?.abort();
    stopTTS();
    setIsLoading(false);
  }, [stopTTS]);

  const clearMessages = useCallback(() => {
    stopTTS();
    memoryManagerRef.current.clear();
    setMessages([]);
  }, [stopTTS]);

  const handleSend = useCallback(
    async (content: string, userImageUrl?: string) => {
      if ((!content.trim() && !userImageUrl) || isLoading) return;

      if (isTtsEnabled) {
        unlockTTS();
      }
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
        content: [],
        timestamp: new Date(),
      };

      const contextMessages: Message[] = [...messages, userMsg];

      setMessages(contextMessages);
      setInput("");
      setIsLoading(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const applyContent = (contentParts: MessageContentPart[]) => {
        assistantMsg = { ...assistantMsg, content: contentParts };
        setMessages([...contextMessages, assistantMsg]);
      };

      try {
        await runAgentPipeline({
          messages: contextMessages,
          memoryManager: memoryManagerRef.current,
          signal: controller.signal,
          onContentChange: applyContent,
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
            content: [{ type: "text", text: CHAT_ERROR_MESSAGE }],
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, isTtsEnabled, messages, feedText, flush, resetTTS, stopTTS, unlockTTS],
  );

  return {
    messages,
    input,
    isLoading,
    isTtsEnabled,
    setInput,
    handleSend,
    handleStop,
    stopSpeech: stopTTS,
    clearMessages,
    toggleTtsEnabled,
  };
};
