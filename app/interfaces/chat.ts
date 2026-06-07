// 消息类型
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  imagePrefix?: string;
  imageUrl?: string;
  videoPrefix?: string;
  videoUrl?: string;
}

/** 用户任务需要生成的输出类型（可组合） */
export interface TaskOutputs {
  text: boolean;
  image: boolean;
  video: boolean;
}

// useChat hook 返回类型
export interface UseChatReturn {
  messages: Message[];
  input: string;
  isLoading: boolean;
  setInput: (value: string) => void;
  handleSend: (content: string) => Promise<void>;
  handleStop: () => void;
  stopSpeech: () => void;
  clearMessages: () => void;
}

// API 响应类型
export interface DetectIntentResponse {
  outputs: TaskOutputs;
}

export interface TextToImageResponse {
  imageUrl: string;
}
