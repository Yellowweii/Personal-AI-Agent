import {
  CONVERSATION_SUMMARY_SYSTEM_PROMPT,
  INCREMENTAL_CONVERSATION_SUMMARY_SYSTEM_PROMPT,
} from "@/constants/systemPrompts";
import type { SummarizeConversationRequest } from "@/interfaces/summarizeConversation";
import { formatMessagesForSummary } from "@/agent/memory/summary/formatMessagesForSummary";

export const POST = async (req: Request) => {
  try {
    const { messages, assets, previousSummary } =
      (await req.json()) as SummarizeConversationRequest;
    const signal = req.signal;

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "缺少待摘要的消息" }, { status: 400 });
    }

    const conversationText = formatMessagesForSummary(messages, assets ?? []);
    const isIncremental = Boolean(previousSummary?.trim());

    const userContent = isIncremental
      ? `已有摘要：\n${previousSummary}\n\n新一轮对话：\n${conversationText}\n\n请合并为更新后的完整摘要。`
      : `请摘要以下对话历史：\n\n${conversationText}`;

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
          messages: [
            {
              role: "system",
              content: isIncremental
                ? INCREMENTAL_CONVERSATION_SUMMARY_SYSTEM_PROMPT
                : CONVERSATION_SUMMARY_SYSTEM_PROMPT,
            },
            { role: "user", content: userContent },
          ],
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
    const summary = raw.trim();

    return Response.json({ summary });
  } catch (error) {
    console.error("summarizeConversation error:", error);
    return Response.json({ error: "服务器内部错误" }, { status: 500 });
  }
};
