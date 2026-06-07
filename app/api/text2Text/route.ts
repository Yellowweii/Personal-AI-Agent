export const POST = async (req: Request) => {
  const { prompt } = (await req.json()) as { prompt?: string };
  const signal = req.signal;

  const taskPrompt = prompt?.trim();
  if (!taskPrompt) {
    return Response.json({ error: "缺少文本生成 prompt" }, { status: 400 });
  }

  const response = await fetch(
    `${process.env.LLM_API_BASE_URL}/v1/chat/completions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.LLM_API_KEY,
      },
      body: JSON.stringify({
        model: process.env.LLM_TEXT_MODEL,
        messages: [{ role: "user", content: taskPrompt }],
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
};
