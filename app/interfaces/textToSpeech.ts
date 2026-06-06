// API 请求体
export interface TextToSpeechRequest {
  text: string;
}

// API 错误响应
export interface TextToSpeechErrorResponse {
  error: string;
}

// 文本切分结果
export interface TextSliceResult {
  slices: string[];
  remainder: string;
}

// 单句 TTS 任务
export interface TtsJob {
  streamPromise: Promise<ReadableStream<Uint8Array>>;
}

// useTextToSpeech hook 返回类型
export interface UseTextToSpeechReturn {
  feedText: (delta: string) => void;
  flush: () => void;
  reset: () => Promise<void>;
  stop: () => void;
  unlock: () => void;
}
