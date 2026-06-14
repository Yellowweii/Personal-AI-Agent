import { IMAGE2TEXT_ERROR_MESSAGE } from "@/constants/image2Text";
import {
  DEFAULT_IMAGE_ASSET_SUMMARY,
  IMAGE_ASSET_SUMMARY_MAX_LENGTH,
} from "@/constants/memory";
import { IMAGE_ASSET_SUMMARY_SYSTEM_PROMPT } from "@/constants/systemPrompts";
import type { SummarizeImageRequest } from "@/interfaces/summarizeImage";

export const POST = async (req: Request) => {
  try {
    const { imageUrl } = (await req.json()) as SummarizeImageRequest;
    const signal = req.signal;

    if (!imageUrl?.trim()) {
      return Response.json({ error: "缺少图片 URL" }, { status: 400 });
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
            { role: "system", content: IMAGE_ASSET_SUMMARY_SYSTEM_PROMPT },
            {
              role: "user",
              content: [
                { type: "text", text: "描述图片" },
                { type: "image_url", image_url: { url: imageUrl } },
              ],
            },
          ],
        }),
        signal,
      },
    );

    if (!response.ok) {
      console.error(
        "summarizeImage 失败:",
        response.status,
        await response.text(),
      );
      return Response.json(
        { error: IMAGE2TEXT_ERROR_MESSAGE },
        { status: response.status },
      );
    }

    const raw = (await response.json()).choices[0].message.content as string;
    const summary =
      raw.trim().slice(0, IMAGE_ASSET_SUMMARY_MAX_LENGTH) ||
      DEFAULT_IMAGE_ASSET_SUMMARY;

    return Response.json(summary);
  } catch (error) {
    console.error("summarizeImage error:", error);
    return Response.json({ error: IMAGE2TEXT_ERROR_MESSAGE }, { status: 500 });
  }
};
