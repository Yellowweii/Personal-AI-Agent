import { Message } from "@/components/Chatbox";

export const text2Text = async ({ messages }: { messages: Message[] }) => {
  const response = await fetch(
    "https://api.siliconflow.cn/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.LLM_API_KEY,
      },
      body: JSON.stringify({
        model: process.env.LLM_TEXT_MODEL,
        messages: messages,
        stream: true,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`LLM API 请求失败: ${response.status}`);
  }

  return new Response(response.body, {
    headers: {
      "Content-Type": "text/event-stream",
    },
  });
};
