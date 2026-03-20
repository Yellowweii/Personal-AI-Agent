"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ==================== 类型定义（供你参考） ====================
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// ==================== 暴露给外部的回调接口 ====================
export interface ChatboxCallbacks {
  /** 发送消息时触发，content 是用户输入，onChunk 是流式输出回调，onDone 是结束时调用 */
  onSend?: (
    content: string,
    onChunk: (text: string) => void,
    onDone: () => void,
  ) => void;
}

// ==================== 主组件 ====================
export function Chatbox({ callbacks }: { callbacks?: ChatboxCallbacks }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    }
  };

  // ================================================================
  // TODO: 在这里实现你的 API 调用逻辑
  // 示例：调用 SiliconFlow API（参考你的 test.js）
  // ================================================================
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
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      setIsLoading(true);

      // ---- 占位：AI 消息 ID 先创建占位 ----
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

      // ============================================================
      // TODO: 替换为你自己的 API 调用实现
      //
      // 下面的示例展示了如何用 fetch 实现流式输出（以 SiliconFlow 为例）。
      // 你可以参考 test.js 的格式，改成你自己的模型、接口、鉴权方式。
      //
      // 推荐使用 ReadableStream + TextDecoder 来解析 SSE 格式的流式响应。
      // ============================================================
      try {
        if (callbacks?.onSend) {
          callbacks.onSend(content, onChunk, onDone);
        } else {
          // 默认示例：调用 SiliconFlow GLM-4.7
          // 注意：正式项目请把 API Key 放到环境变量，不要硬编码！
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messages: newMessages,
            }),
          });

          const reader = response.body?.getReader();
          const decoder = new TextDecoder();

          if (reader) {
            let buffer = "";
            while (true) {
              const { done, value } = await reader.read();
              onDone();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");

              buffer = lines.pop() || "";

              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  const data = line.slice(6).trim();
                  if (data === "[DONE]") continue;
                  try {
                    const parsed = JSON.parse(data);
                    const chunk = parsed.choices?.[0]?.delta?.content;
                    if (chunk) onChunk(chunk);
                  } catch {
                    // ignore parse errors
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("API 调用失败:", err);
        setMessages((prev) => [
          ...prev,
          {
            id: assistantId,
            role: "assistant",
            content: "抱歉，发生了错误，请稍后重试。",
            timestamp: new Date(),
          },
        ]);
        setIsLoading(false);
        onDone();
      }
    },
    [isLoading, callbacks, messages],
  );

  const handleSubmit = (e?: { preventDefault?: () => void }) => {
    if (e?.preventDefault) e.preventDefault();
    handleSend(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-white">
      {/* 顶部标题栏 */}
      <header className="flex-none flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-semibold text-white">AI Chat</h1>
            <p className="text-xs text-white/40">流式响应 · 多轮对话</p>
          </div>
        </div>
        <button
          onClick={() => setMessages([])}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 text-xs text-white/60 hover:bg-white/10 hover:text-white/80 transition-colors"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          清空对话
        </button>
      </header>

      {/* 聊天消息区域 */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full pt-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                开始一段新的对话
              </h2>
              <p className="text-sm text-white/40 max-w-sm">
                在下方输入你的问题，AI 将实时为你解答，支持多轮对话
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              {/* 头像 */}
              <div
                className={`flex-none w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-linear-to-br from-purple-500 to-pink-500 text-white"
                }`}
              >
                {message.role === "user" ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                )}
              </div>

              {/* 消息内容 */}
              <div
                className={`flex-1 max-w-[75%] ${
                  message.role === "user" ? "text-right" : ""
                }`}
              >
                <div
                  className={`inline-block px-4 py-3 rounded-2xl text-sm leading-relaxed text-left whitespace-pre-wrap wrap-break-word ${
                    message.role === "user"
                      ? "bg-blue-500 text-white rounded-tr-sm"
                      : "bg-white/5 text-white/90 rounded-tl-sm"
                  }`}
                >
                  {message.content}
                </div>
                <div className="mt-1 text-[10px] text-white/30">
                  {message.role === "user" ? "你" : "AI"} ·{" "}
                  {message.timestamp.toLocaleTimeString("zh-CN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))}

          {/* 加载指示器 */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex-none w-8 h-8 rounded-lg bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <div className="inline-block px-4 py-3 rounded-2xl rounded-tl-sm bg-white/5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* 输入区域 */}
      <footer className="flex-none px-4 pb-6 pt-2">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative flex items-end gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-2xl focus-within:border-white/20 transition-colors">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  adjustTextareaHeight();
                }}
                onKeyDown={handleKeyDown}
                placeholder="输入你的问题，按 Enter 发送，Shift+Enter 换行..."
                disabled={isLoading}
                rows={1}
                className="flex-1 bg-transparent text-sm text-white placeholder-white/30 resize-none outline-none max-h-40 py-1 leading-relaxed disabled:opacity-50"
                style={{ minHeight: "24px" }}
              />
              <div className="flex items-center gap-2 flex-none">
                {isLoading && (
                  <button
                    type="button"
                    onClick={() => setIsLoading(false)}
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                    title="停止生成"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <rect x="6" y="6" width="12" height="12" rx="1" />
                    </svg>
                  </button>
                )}
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <p className="text-center text-[10px] text-white/20 mt-2">
              AI 可能会产生不准确的信息，请谨慎辨别
            </p>
          </form>
        </div>
      </footer>
    </div>
  );
}
