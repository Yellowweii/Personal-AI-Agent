import { TASK_SPEC_GENERATION_SYSTEM_PROMPT } from "@/constants/systemPrompts";
import type { GenerateTaskSpecsRequest } from "@/interfaces/generateTaskSpecs";
import { normalizeTaskSpecs } from "@/lib/normalizeTaskSpecs";

export const POST = async (req: Request) => {
  try {
    const { context, steps, fallbackPrompt } =
      (await req.json()) as GenerateTaskSpecsRequest;
    const signal = req.signal;

    if (!Array.isArray(steps) || steps.length === 0) {
      return Response.json({ taskSpecs: [] });
    }

    const systemContent = context.systemContext
      ? `${TASK_SPEC_GENERATION_SYSTEM_PROMPT}\n\n${context.systemContext}`
      : TASK_SPEC_GENERATION_SYSTEM_PROMPT;

    const specResponse = await fetch(
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
            { role: "system", content: systemContent },
            ...context.messages,
            {
              role: "user",
              content: `Planner 工具列表：${JSON.stringify(steps)}`,
            },
          ],
        }),
        signal,
      },
    );

    if (!specResponse.ok) {
      return Response.json(normalizeTaskSpecs(null, steps, fallbackPrompt), {
        status: 200,
      });
    }

    const raw = (await specResponse.json()).choices[0].message
      .content as string;

    return Response.json(normalizeTaskSpecs(raw, steps, fallbackPrompt));
  } catch (error) {
    console.error("generateTaskSpecs error:", error);
    return Response.json({ error: "任务规格生成失败" }, { status: 500 });
  }
};
