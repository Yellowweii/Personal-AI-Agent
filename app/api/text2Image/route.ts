export const POST = async (req: Request) => {
  const { messages } = await req.json();
  const signal = req.signal;

  const descriptionResponse = await fetch(
    "https://api.siliconflow.cn/v1/chat/completions",
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
            content:
              "根据对话历史，提炼出一段完整的图片生成描述，只返回描述内容，不要其他内容。",
          },
          ...messages,
        ],
      }),
      signal,
    },
  );

  if (!descriptionResponse.ok) {
    throw new Error(`描述生成 API 请求失败: ${descriptionResponse.status}`);
  }

  const description = (await descriptionResponse.json()).choices[0].message
    .content;

  const imageResponse = await fetch(
    "https://api.siliconflow.cn/v1/images/generations",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.LLM_IMAGE_MODEL,
        prompt: description,
      }),
      signal,
    },
  );

  if (!imageResponse.ok) {
    throw new Error(`文生图 API 请求失败: ${imageResponse.status}`);
  }

  const imageUrl = (await imageResponse.json()).data[0].url;
  return Response.json({ imageUrl });
};
