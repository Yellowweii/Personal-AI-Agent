import {
  CONVERSATION_SUMMARY_SYSTEM_PROMPT,
  INCREMENTAL_CONVERSATION_SUMMARY_SYSTEM_PROMPT,
} from "@/constants/systemPrompts";
import type { SummarizeConversationRequest } from "@/interfaces/summarizeConversation";
import { formatHistoryMessages } from "@/agent/memory/summary/formatHistoryMessages";
import type { LlmApiMessage } from "@/lib/messageContent";

type SummaryLlmMessage = {
  role: "system" | "user" | "assistant";
  content: LlmApiMessage["content"];
};

export const POST = async (req: Request) => {
  try {
    const { messages, assets, previousSummary } =
      (await req.json()) as SummarizeConversationRequest;
    const signal = req.signal;

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "缺少待摘要的消息" }, { status: 400 });
    }

    const isIncremental = Boolean(previousSummary?.trim());
    const formattedHistoryMessages = formatHistoryMessages(
      messages,
      assets ?? [],
    );

    const systemContent = isIncremental
      ? `${INCREMENTAL_CONVERSATION_SUMMARY_SYSTEM_PROMPT}\n\n# 已有摘要\n\n${previousSummary}`
      : CONVERSATION_SUMMARY_SYSTEM_PROMPT;

    const llmMessages: SummaryLlmMessage[] = [
      { role: "system", content: systemContent },
      ...formattedHistoryMessages,
    ];

    const response = await fetch(
      `${process.env.LLM_API_BASE_URL}/v1/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.LLM_API_KEY}`,
        },
        body: JSON.stringify({
          model: process.env.LLM_TEXT_MODEL,
          messages: llmMessages,
        }),
        signal,
      },
    );

    if (!response.ok) {
      return Response.json(
        { error: "对话摘要生成失败，请稍后重试" },
        { status: response.status },
      );
    }

    const raw = (await response.json()).choices[0].message.content as string;

    return Response.json(raw.trim());
  } catch (error) {
    console.error("summarizeConversation error:", error);
    return Response.json({ error: "服务器内部错误" }, { status: 500 });
  }
};
