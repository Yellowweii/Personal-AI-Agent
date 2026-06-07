import { IMAGE2TEXT_ERROR_MESSAGE } from "@/constants/image2Text";
import type { Image2TextRequest } from "@/interfaces/image2Text";

export const POST = async (req: Request) => {
  try {
    const { imageUrl, prompt } = (await req.json()) as Image2TextRequest;
    const signal = req.signal;

    if (!imageUrl?.trim()) {
      return Response.json({ error: "缺少图片 URL" }, { status: 400 });
    }

    const taskPrompt = prompt?.trim();
    if (!taskPrompt) {
      return Response.json({ error: "缺少图片理解 prompt" }, { status: 400 });
    }

    const response = await fetch(
      `${process.env.LLM_API_BASE_URL}/v1/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.LLM_API_KEY}`,
        },
        body: JSON.stringify({
          model:
            process.env.LLM_IMAGE2TEXT_MODEL ?? process.env.LLM_TEXT_MODEL,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: taskPrompt },
                {
                  type: "image_url",
                  image_url: { url: imageUrl },
                },
              ],
            },
          ],
          stream: true,
        }),
        signal,
      },
    );

    if (!response.ok) {
      console.error(
        "image2Text 失败:",
        response.status,
        await response.text(),
      );
      return Response.json(
        { error: IMAGE2TEXT_ERROR_MESSAGE },
        { status: response.status },
      );
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
      },
    });
  } catch (error) {
    console.error("image2Text error:", error);
    return Response.json({ error: IMAGE2TEXT_ERROR_MESSAGE }, { status: 500 });
  }
};
