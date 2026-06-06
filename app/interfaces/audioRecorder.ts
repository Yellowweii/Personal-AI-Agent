export type AudioRecorderStatus = "idle" | "recording" | "processing" | "error";

export interface SpeechToTextResponse {
  text: string;
}

export interface UseAudioRecorderReturn {
  status: AudioRecorderStatus;
  error: string | null;
  isSupported: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  getAudioBlob: () => Blob | null;
}
