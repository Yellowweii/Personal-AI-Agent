export const text2Image = async (prompt: string) => {
  const response = await fetch(
    "https://api.siliconflow.cn/v1/images/generations",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LLM_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.LLM_IMAGE_MODEL,
        prompt: prompt,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`文生图 API 请求失败: ${response.status}`);
  }

  const data = await response.json();
  return data.images[0].url;
};
