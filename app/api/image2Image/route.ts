import {
  DEFAULT_IMAGE2IMAGE_SIZE,
  IMAGE2IMAGE_ERROR_MESSAGE,
} from "@/constants/image2Image";
import type { Image2ImageRequest } from "@/interfaces/image2Image";

export const POST = async (req: Request) => {
  try {
    const { imageUrl, prompt } = (await req.json()) as Image2ImageRequest;
    const signal = req.signal;

    const editPrompt = prompt?.trim();
    if (!editPrompt) {
      return Response.json({ error: "缺少图片编辑 prompt" }, { status: 400 });
    }

    if (!imageUrl?.trim()) {
      return Response.json({ error: "缺少图片 URL" }, { status: 400 });
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
          model:
            process.env.LLM_IMAGE2IMAGE_MODEL ??
            process.env.LLM_TEXT2IMAGE_MODEL,
          prompt: editPrompt,
          size: DEFAULT_IMAGE2IMAGE_SIZE,
          extra_body: {
            image: [imageUrl],
            response_format: "url",
          },
        }),
        signal,
      },
    );

    if (!imageResponse.ok) {
      console.error(
        "image2Image 失败:",
        imageResponse.status,
        await imageResponse.text(),
      );
      return Response.json(
        { error: IMAGE2IMAGE_ERROR_MESSAGE },
        { status: imageResponse.status },
      );
    }

    const resultImageUrl = (await imageResponse.json()).data[0].url;
    return Response.json({ imageUrl: resultImageUrl });
  } catch (error) {
    console.error("image2Image error:", error);
    return Response.json({ error: IMAGE2IMAGE_ERROR_MESSAGE }, { status: 500 });
  }
};
