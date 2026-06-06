import { IMAGE_PROMPT_SYSTEM_PROMPT } from "@/constants/prompts";

const chatCompletion = async (
  system: string,
  messages: unknown[],
  signal: AbortSignal,
) => {
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
        messages: [{ role: "system", content: system }, ...messages],
      }),
      signal,
    },
  );

  if (!response.ok) {
    throw new Error(`LLM 请求失败: ${response.status}`);
  }

  return (await response.json()).choices[0].message.content as string;
};

export const POST = async (req: Request) => {
  try {
    const { messages } = await req.json();
    const signal = req.signal;

    const imagePrompt = await chatCompletion(
      IMAGE_PROMPT_SYSTEM_PROMPT,
      messages,
      signal,
    );

    const imageResponse = await fetch(
      `${process.env.LLM_API_BASE_URL}/v1/images/generations`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.LLM_API_KEY}`,
        },
        body: JSON.stringify({
          model: process.env.LLM_IMAGE_MODEL,
          prompt: imagePrompt,
        }),
        signal,
      },
    );

    if (!imageResponse.ok) {
      throw new Error(`文生图 API 请求失败: ${imageResponse.status}`);
    }

    const imageUrl = (await imageResponse.json()).data[0].url;
    return Response.json({ imageUrl });
  } catch (error) {
    console.error("text2Image error:", error);
    return Response.json({ error: "图片生成失败" }, { status: 500 });
  }
};
