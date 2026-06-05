import type { Intent, Message } from "@/interfaces/chat";

export const detectIntent = async (
  messages: Message[],
  signal?: AbortSignal,
): Promise<Intent> => {
  const response = await fetch("/api/detectIntent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
    signal,
  });

  if (!response.ok) {
    throw new Error("意图判断失败，请稍后重试");
  }

  const data: { intent: string } = await response.json();
  const intent = data?.intent?.trim().toUpperCase();

  if (intent === "IMAGE" || intent === "MULTIMODAL") {
    return intent;
  }

  return "TEXT";
};
