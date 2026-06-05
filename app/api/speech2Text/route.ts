import { DEFAULT_SPEECH_MODEL } from "@/constants/models";

export const POST = async (req: Request) => {
  try {
    const formData = await req.formData();
    const audio = formData.get("audio");

    if (!audio || !(audio instanceof Blob)) {
      return Response.json({ error: "未收到音频文件" }, { status: 400 });
    }

    const apiFormData = new FormData();
    apiFormData.append("file", audio, "recording.webm");
    apiFormData.append(
      "model",
      process.env.LLM_SPEECH_MODEL ?? DEFAULT_SPEECH_MODEL,
    );

    const response = await fetch(
      "https://api.siliconflow.cn/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.LLM_API_KEY}`,
        },
        body: apiFormData,
      },
    );

    if (!response.ok) {
      console.error("SiliconFlow STT 失败:", response.status, await response.text());
      return Response.json({ error: "语音转文字失败" }, { status: response.status });
    }

    const result = (await response.json()) as { text: string };
    return Response.json({ text: result.text });
  } catch (error) {
    console.error("speechToText error:", error);
    return Response.json({ error: "服务器内部错误" }, { status: 500 });
  }
};
