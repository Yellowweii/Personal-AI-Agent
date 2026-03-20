export const POST = async (req: Request) => {
  const { messages } = await req.json();
  const response = await fetch("https://api.siliconflow.cn/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.LLM_API_KEY,
    },
    body: JSON.stringify({
      model: process.env.LLM_MODEL,
      messages: messages,
      stream: true,
    }),
  });

  if (!response.ok) {
    return Response.json(
      { error: "LLM API 请求失败" },
      { status: response.status }
    );
  }

  return new Response(response.body, {
    headers: {
      "Content-Type": "text/event-stream",
    },
  });
};