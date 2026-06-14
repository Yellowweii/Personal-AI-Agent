export type SpeechToTextStatus = "idle" | "recording" | "processing" | "error";

export interface SpeechToTextResponse {
  text: string;
}

export interface UseSpeechToTextReturn {
  status: SpeechToTextStatus;
  error: string | null;
  isSupported: boolean;
  startListening: () => Promise<void>;
  stopListening: () => Promise<Blob | null>;
  getCapturedAudio: () => Blob | null;
}
