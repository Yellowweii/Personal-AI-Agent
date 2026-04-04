export const POST = async (req: Request) => {
  try {
    const { messages } = await req.json();
    const signal = req.signal;

    // 1. 判断用户意图
    const intentResponse = await fetch(
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
              content: `你是一个意图分类器，判断用户是否明确想要生成图片。
                  规则：
                  - 只有用户明确说"画"、"生成图片"、"图片"、"绘制"等词，才返回 IMAGE
                  - 其他所有情况一律返回 TEXT
                  - 只返回 IMAGE 或 TEXT，不要返回其他内容`,
            },
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

    return Response.json({
      intent: (await intentResponse.json()).choices[0].message.content,
    });
  } catch (error) {
    console.error("detectIntent error:", error);
    return Response.json({ error: "服务器内部错误" }, { status: 500 });
  }
};
