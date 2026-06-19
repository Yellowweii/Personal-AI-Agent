import { SUMMARIZE_TOOL_RESULTS_SYSTEM_PROMPT } from "@/constants/systemPrompts";
import type { SummarizeToolResultsRequest } from "@/interfaces/summarizeToolResults";
import { buildSummarizeToolResultsUserMessage } from "@/lib/buildSummarizeToolResultsUserMessage";

export const POST = async (req: Request) => {
  try {
    const body = (await req.json()) as SummarizeToolResultsRequest;
    const signal = req.signal;

    if (!body.get_weather && !body.get_location) {
      return Response.json({ error: "缺少可总结的工具结果" }, { status: 400 });
    }

    const userContent = buildSummarizeToolResultsUserMessage(body.userMessage, {
      get_location: body.get_location,
      get_weather: body.get_weather,
    });

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
            { role: "system", content: SUMMARIZE_TOOL_RESULTS_SYSTEM_PROMPT },
            { role: "user", content: userContent },
          ],
          stream: true,
        }),
        signal,
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
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    console.error("summarizeToolResults error:", error);
    return Response.json({ error: "工具结果总结失败" }, { status: 500 });
  }
};
