"use client";

import { Chatbox } from "../components/Chatbox";

/**
 * 使用示例 2：自定义 API 逻辑（推荐方式）
 *
 * 通过 callbacks.onSend 回调，你可以完全控制如何调用你的 LLM。
 *
 * 参数说明：
 *   - content: 用户输入的文本
 *   - onChunk: 每收到一块内容就调用一次，用于流式更新 UI
 *   - onDone:  stream结束时调用
 *
 * 注意：
 *   1. API Key 不要硬编码，使用环境变量（如 process.env.YOUR_API_KEY）
 *   2. 如果使用第三方流式 API，推荐用 fetch + ReadableStream 解析 SSE
 *   3. 如果不使用流式，调用完 onChunk 再调用 onDone 即可
 *   4. 如果出错，调用 onDone() 即可，错误提示你可以在 onSend 内部处理
 */
export default function ExampleCustom() {
  return (
    <Chatbox
      callbacks={{
        onSend: async (content, onChunk, onDone) => {
          try {
            // ==========================================================
            // 示例：调用你自己的 API
            // 下面的示例使用 fetch + ReadableStream 解析 SSE 流式响应
            // ==========================================================

            const response = await fetch("YOUR_API_ENDPOINT", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.NEXT_PUBLIC_YOUR_API_KEY}`,
              },
              body: JSON.stringify({
                model: "your-model-name",
                messages: [{ role: "user", content }],
                stream: true,
              }),
            });

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (reader) {
              let buffer = "";
              while (true) {
                const { done, value } = await reader.read();
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
                      // =============================================
                      // TODO: 根据你的 API 返回格式调整这里
                      // 这里假设返回格式是：{ choices: [{ delta: { content: "..." } }] }
                      // =============================================
                      const chunk = parsed.choices?.[0]?.delta?.content;
                      if (chunk) onChunk(chunk);
                    } catch {
                      // ignore parse errors
                    }
                  }
                }
              }
            }

            onDone();
          } catch (error) {
            console.error("API 调用失败:", error);
            // 如果需要显示错误，可以在这里 onChunk 一条错误消息
            onChunk("抱歉，发生了错误，请稍后重试。\n");
            onDone();
          }
        },
      }}
    />
  );
}
