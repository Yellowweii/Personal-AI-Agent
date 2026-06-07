export const POST = async (req: Request) => {
  try {
    const { prompt } = (await req.json()) as { prompt?: string };
    const signal = req.signal;

    const imagePrompt = prompt?.trim();
    if (!imagePrompt) {
      return Response.json({ error: "缺少图片生成 prompt" }, { status: 400 });
    }

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
