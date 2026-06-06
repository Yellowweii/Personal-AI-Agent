// Azure PCM 格式（24kHz / 16bit / mono）
export const TTS_SAMPLE_RATE = 24000;
export const TTS_BYTES_PER_SAMPLE = 2;
export const TTS_BYTES_PER_SECOND = TTS_SAMPLE_RATE * TTS_BYTES_PER_SAMPLE;

// 播放缓冲：收到多少音频后再开始播
export const TTS_PREFETCH_MS = 400;
export const TTS_PREFETCH_BYTES =
  (TTS_BYTES_PER_SECOND * TTS_PREFETCH_MS) / 1000;

// 每次排进 Web Audio 的 PCM 块大小
export const TTS_PLAY_CHUNK_MS = 80;
export const TTS_PLAY_CHUNK_BYTES =
  (TTS_BYTES_PER_SECOND * TTS_PLAY_CHUNK_MS) / 1000;

// 文本切分：句末标点
export const TTS_SENTENCE_ENDINGS = "。！？.!?\n";

// 播放时间轴起始延迟（秒）
export const TTS_PLAYBACK_START_DELAY_S = 0.05;

// 浏览器 autoplay 解锁用静音 WAV
export const TTS_SILENT_AUDIO_DATA_URL =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
export const TTS_UNLOCK_PROBE_VOLUME = 0.01;

// Azure TTS 默认配置
export const DEFAULT_AZURE_TTS_VOICE = "zh-CN-XiaoxiaoNeural";
export const AZURE_TTS_OUTPUT_FORMAT = "raw-24khz-16bit-mono-pcm";

// 错误提示
export const TTS_FETCH_ERROR_MESSAGE = "语音合成失败，请稍后重试";
