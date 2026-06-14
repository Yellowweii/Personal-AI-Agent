import type { Message } from "@/agent/types/message";

export interface UseChatReturn {
  messages: Message[];
  input: string;
  isLoading: boolean;
  isTtsEnabled: boolean;
  setInput: (value: string) => void;
  handleSend: (content: string, userImageUrl?: string) => Promise<void>;
  handleStop: () => void;
  stopSpeech: () => void;
  clearMessages: () => void;
  toggleTtsEnabled: () => void;
}
