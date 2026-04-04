"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@/hooks/useChat";
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

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = () => {
    handleSend(input);
  };

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

          {isLoading && <LoadingIndicator />}

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
          />
        </div>
      </footer>
    </div>
  );
};
