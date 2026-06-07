import { DETECT_INTENT_SYSTEM_PROMPT } from "@/constants/systemPrompts";
import { normalizeTaskOutputs } from "@/utils/normalizeTaskOutputs";

export const POST = async (req: Request) => {
  try {
    const { messages } = await req.json();
    const signal = req.signal;

    const intentResponse = await fetch(
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
            { role: "system", content: DETECT_INTENT_SYSTEM_PROMPT },
            ...messages,
          ],
        }),
        signal,
      },
    );

    if (!intentResponse.ok) {
      return Response.json(
        { error: "意图判断失败，请稍后重试" },
        { status: intentResponse.status },
      );
    }

    const raw = (await intentResponse.json()).choices[0].message
      .content as string;

    return Response.json({
      outputs: normalizeTaskOutputs(raw),
    });
  } catch (error) {
    console.error("detectIntent error:", error);
    return Response.json({ error: "服务器内部错误" }, { status: 500 });
  }
};
