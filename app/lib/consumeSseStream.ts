export const consumeSseStream = async (
  response: Response,
  onChunk: (text: string) => void,
  onDone: () => void,
  signal?: AbortSignal,
) => {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("无法读取响应流");

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        onDone();
        break;
      }

      if (signal?.aborted) {
        reader.cancel();
        throw new DOMException("Aborted", "AbortError");
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;

        const data = line.slice(6).trim();
        if (!data || data === "[DONE]") continue;

        try {
          const parsed = JSON.parse(data);
          const chunk = parsed.choices?.[0]?.delta?.content;
          if (chunk) onChunk(chunk);
        } catch {
          // 忽略无法解析的 SSE 行
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
};
