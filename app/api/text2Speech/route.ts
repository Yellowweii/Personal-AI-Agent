import {
  AZURE_TTS_OUTPUT_FORMAT,
  DEFAULT_AZURE_TTS_VOICE,
  TTS_FETCH_ERROR_MESSAGE,
} from "@/constants/textToSpeech";
import type {
  TextToSpeechErrorResponse,
  TextToSpeechRequest,
} from "@/interfaces/textToSpeech";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const escapeXml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export const POST = async (request: Request) => {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;

  if (!key || !region) {
    return Response.json(
      {
        error:
          "Azure Speech 未配置，请设置 AZURE_SPEECH_KEY 和 AZURE_SPEECH_REGION",
      } satisfies TextToSpeechErrorResponse,
      { status: 503 },
    );
  }

  let body: TextToSpeechRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "请求格式无效" } satisfies TextToSpeechErrorResponse,
      { status: 400 },
    );
  }

  const text = body.text?.trim();
  if (!text) {
    return Response.json(
      { error: "文本不能为空" } satisfies TextToSpeechErrorResponse,
      { status: 400 },
    );
  }

  const voice = process.env.AZURE_TTS_VOICE ?? DEFAULT_AZURE_TTS_VOICE;
  const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='zh-CN'><voice name='${voice}'>${escapeXml(text)}</voice></speak>`;

  try {
    const response = await fetch(
      `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": key,
          "Content-Type": "application/ssml+xml",
          "X-Microsoft-OutputFormat": AZURE_TTS_OUTPUT_FORMAT,
        },
        body: ssml,
      },
    );

    if (!response.ok || !response.body) {
      const detail = await response.text().catch(() => "");
      console.error("Azure TTS error:", response.status, detail);
      return Response.json(
        { error: TTS_FETCH_ERROR_MESSAGE } satisfies TextToSpeechErrorResponse,
        { status: 502 },
      );
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Azure TTS request failed:", error);
    return Response.json(
      { error: TTS_FETCH_ERROR_MESSAGE } satisfies TextToSpeechErrorResponse,
      { status: 502 },
    );
  }
};
