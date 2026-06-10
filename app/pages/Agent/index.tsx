"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useChat } from "@/hooks/useChat";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { speechToText } from "@/agent/tools/speechToText";
import { ChatHeader } from "@/pages/Agent/components/ChatHeader";
import { EmptyState } from "@/pages/Agent/components/EmptyState";
import { MessageBubble } from "@/pages/Agent/components/MessageBubble";
import { LoadingIndicator } from "@/pages/Agent/components/LoadingIndicator";
import { ChatInput } from "@/pages/Agent/components/ChatInput";

export const Agent = () => {
  const {
    messages,
    input,
    isLoading,
    setInput,
    handleSend,
    handleStop,
    stopSpeech,
    clearMessages,
  } = useChat();

  const {
    status,
    error: voiceError,
    isSupported,
    startListening,
    stopListening,
  } = useSpeechToText();

  const [isTranscribing, setIsTranscribing] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const {
    pendingImagePreview,
    pendingImageUrl,
    isUploading,
    uploadProgress,
    uploadError,
    handleImageSelect,
    clearPendingImage,
    clearUploadError,
  } = useImageUpload();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async () => {
    if (
      (!input.trim() && !pendingImageUrl) ||
      isLoading ||
      status === "recording" ||
      isTranscribing ||
      isUploading
    ) {
      return;
    }

    clearUploadError();

    const content = input;
    const userImageUrl = pendingImageUrl ?? undefined;
    clearPendingImage();
    await handleSend(content, userImageUrl);
  };

  const handleStartVoice = useCallback(async () => {
    stopSpeech();
    setInput("");
    await startListening();
  }, [setInput, startListening, stopSpeech]);

  const handleStopVoice = useCallback(async () => {
    setIsTranscribing(true);
    try {
      const audioBlob = await stopListening();
      if (!audioBlob || audioBlob.size === 0) return;

      const { text } = await speechToText(audioBlob);
      if (text) {
        setInput(text);
      }
    } catch (err) {
      console.error("上传音频失败:", err);
    } finally {
      setIsTranscribing(false);
    }
  }, [stopListening, setInput]);

  return (
    <div className="flex flex-col h-dvh bg-[#0a0a0a] text-white safe-area-inset">
      <ChatHeader onClear={clearMessages} />

      <main className="flex-1 overflow-y-auto py-4 sm:py-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4 sm:space-y-6">
          {messages.length === 0 && <EmptyState />}

          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              bottomRef={bottomRef}
              isGenerating={
                isLoading &&
                message.role === "assistant" &&
                index === messages.length - 1
              }
            />
          ))}

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
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
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            pendingImagePreview={pendingImagePreview}
            pendingImageUrl={pendingImageUrl}
            uploadError={uploadError}
            onImageSelect={handleImageSelect}
            onImageRemove={clearPendingImage}
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
