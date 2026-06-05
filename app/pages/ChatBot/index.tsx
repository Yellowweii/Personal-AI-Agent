"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useChat } from "@/hooks/useChat";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { ChatHeader } from "@/pages/ChatBot/components/ChatHeader";
import { EmptyState } from "@/pages/ChatBot/components/EmptyState";
import { MessageBubble } from "@/pages/ChatBot/components/MessageBubble";
import { LoadingIndicator } from "@/pages/ChatBot/components/LoadingIndicator";
import { ChatInput } from "@/pages/ChatBot/components/ChatInput";

export const ChatBot = () => {
  const {
    messages,
    input,
    isLoading,
    setInput,
    handleSend,
    handleStop,
    clearMessages,
  } = useChat();

  const {
    status,
    error: voiceError,
    isSupported,
    startRecording,
    stopRecording,
  } = useAudioRecorder();

  const [isTranscribing, setIsTranscribing] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = () => {
    if (
      !input.trim() ||
      isLoading ||
      status === "recording" ||
      isTranscribing
    ) {
      return;
    }
    handleSend(input);
  };

  const handleStartVoice = useCallback(async () => {
    setInput("");
    await startRecording();
  }, [setInput, startRecording]);

  const handleStopVoice = useCallback(async () => {
    setIsTranscribing(true);
    try {
      const audioBlob = await stopRecording();
      if (!audioBlob || audioBlob.size === 0) return;

      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const response = await fetch("/api/speech2Text", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        console.error("语音转文字失败");
        return;
      }

      const result = (await response.json()) as { text?: string };
      if (result.text) {
        setInput(result.text);
      }
    } catch (err) {
      console.error("上传音频失败:", err);
    } finally {
      setIsTranscribing(false);
    }
  }, [stopRecording, setInput]);

  return (
    <div className="flex flex-col h-dvh bg-[#0a0a0a] text-white safe-area-inset">
      <ChatHeader onClear={clearMessages} />

      <main className="flex-1 overflow-y-auto py-4 sm:py-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4 sm:space-y-6">
          {messages.length === 0 && <EmptyState />}

          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              bottomRef={bottomRef}
            />
          ))}

          {isLoading &&
            messages[messages.length - 1]?.role !== "assistant" && (
              <LoadingIndicator />
            )}

          <div ref={bottomRef} />
        </div>
      </main>

      <footer className="flex-none pb-3 pt-2 sm:pb-6 safe-area-bottom">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            onStop={handleStop}
            isLoading={isLoading}
            isRecording={status === "recording"}
            isTranscribing={isTranscribing}
            onStartVoice={handleStartVoice}
            onStopVoice={handleStopVoice}
            isVoiceSupported={isSupported}
            voiceError={voiceError}
          />
        </div>
      </footer>
    </div>
  );
};
