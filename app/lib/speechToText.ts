import type { SpeechToTextResponse } from "@/interfaces/audioRecorder";

export const speechToText = async (
  audio: Blob,
): Promise<SpeechToTextResponse> => {
  const formData = new FormData();
  formData.append("audio", audio, "recording.webm");

  const response = await fetch("/api/speech2Text", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("语音转文字失败，请稍后重试");
  }

  return response.json();
};
