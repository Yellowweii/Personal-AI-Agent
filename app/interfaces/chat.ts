// 消息类型
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  imageUrl?: string;
}

// 意图类型
export type Intent = "TEXT" | "IMAGE";

// useChat hook 返回类型
export interface UseChatReturn {
  messages: Message[];
  input: string;
  isLoading: boolean;
  setInput: (value: string) => void;
  handleSend: (content: string) => Promise<void>;
  handleStop: () => void;
  clearMessages: () => void;
}

// API 响应类型
export interface DetectIntentResponse {
  intent: Intent;
}

export interface TextToImageResponse {
  imageUrl: string;
}
