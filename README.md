# Personal AI Agent

基于 Next.js 构建的个人 AI Agent。用户描述目标后，Agent 会先识别意图、生成任务规格，再调用文字、图片、语音等多模态能力完成任务——而不只是简单的一问一答。

## 功能特性

- **意图识别**：解析用户需要哪些输出（文字 / 图片 / 视频，可任意组合）
- **任务规划**：根据意图生成可执行的 `TaskSpec`，再并行调度多模态工具
- **会话记忆**：滚动摘要历史消息，按阶段选取上下文（意图识别 / 任务规格 / 工具调用）
- **文生文**：流式输出，支持多轮上下文
- **文生图**：根据任务上下文生成图片
- **文生视频**：基于 Agnes Video V2.0 异步生成视频
- **图片上传**：支持附带图片提问，上传至七牛云 OSS
- **图生文**：结合视觉模型理解用户上传的图片
- **语音输入（STT）**：浏览器录音，上传后转写为文字
- **语音播报（TTS）**：LLM 边输出边合成，按句排队无缝播放；支持开关切换，偏好持久化到 `localStorage`
- **任务中断**：支持停止生成与停止播报
- **会话控制**：一键重置会话，清除消息与记忆

## 架构概览

### Agent 流水线

用户发送消息后，`runAgentPipeline` 依次执行：

1. **同步记忆**：`MemoryManager` 写入新消息、提取资产摘要、按需滚动压缩历史
2. **意图识别**：`detectIntent` 解析 `TaskOutputs`（`text` / `image` / `video` 布尔组合）
3. **任务规格**：`generateTaskSpecs` 将意图步骤转为可执行的 `TaskSpec`
4. **并行执行**：`executeTaskSpec` 调度文生文 / 文生图 / 文生视频等工具，流式合并展示

### 意图识别与多模态路由

| 输出组合 | 行为 |
|----------|------|
| 仅 `text` | 流式文字回复 |
| 仅 `image` | 生成图片 |
| 仅 `video` | 生成视频（异步轮询） |
| `text` + `image` | 并行生成文字与图片 |
| `text` + `video` | 并行生成文字与视频 |
| `text` + `image` + `video` | 三者并行生成 |
| `image` + `video` | 并行生成图片与视频 |

### 流式 TTS 播报

文字回复过程中，系统将输出按句切分，调用 Azure Speech 合成音频，并通过 Web Audio API 排队播放。用户可在顶栏切换「朗读回复 / 已静音」，偏好通过 `useTtsEnabled` 持久化；切换时由 Sonner Toast 给出反馈。

### 会话记忆

`MemoryManager` 维护三层存储：

- **ConversationStore**：完整消息列表
- **AssetStore**：图片 / 视频资产摘要
- **MemoryStore**：滚动压缩后的会话摘要

上下文按阶段选取：`selectIntentContext` → `selectTaskSpecContext` → `selectToolContext`。

## 技术栈

- **框架**：Next.js 16 · React 19 · TypeScript
- **样式**：Tailwind CSS 4
- **通知**：Sonner（TTS 开关等轻量反馈）
- **LLM**：OpenAI 兼容 API（文生文 / 意图识别 / 文生图 / 文生视频 / 图生文）
- **STT**：OpenAI 兼容 API 或 SiliconFlow 等
- **TTS**：Azure Cognitive Services Speech
- **存储**：七牛云 OSS（图片上传）

## 项目结构

```
agent/                        # Agent 核心
├── planner/                  # 意图识别 · 任务规格 · 流水线
├── executor/                 # TaskSpec 执行调度
├── tools/                    # 多模态工具前端封装
├── memory/                   # 记忆与上下文（store · summary · contextBuilder · contextSelection）
└── types/                    # 领域模型
app/
├── api/                      # 后端 API 路由
│   ├── detectIntent/         # 意图识别
│   ├── generateTaskSpecs/    # 任务规格生成
│   ├── text2Text/            # 文生文（流式）
│   ├── text2Image/           # 文生图
│   ├── text2Video/           # 文生视频
│   ├── text2Speech/          # 文字转语音
│   ├── speech2Text/          # 语音转文字
│   ├── image2Text/           # 图生文
│   ├── uploadImage/          # 图片上传（七牛云）
│   ├── summarizeImage/       # 图片摘要
│   └── summarizeConversation/# 会话摘要
├── css/                      # 全局样式与 Sonner 覆盖
├── layout.tsx                # 根布局（元数据 · AppToaster）
└── page.tsx
hooks/                        # useChat · useTextToSpeech · useTtsEnabled · useSpeechToText · useImageUpload
interfaces/                   # API / Hook 契约类型
constants/                    # 常量与 system prompt
lib/                          # 前端工具与 API 封装
views/Agent/                  # Agent 主界面与组件
svgs/                         # SVG 图标组件
public/                       # 静态资源
```

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

```bash
cp .env.example .env.local
```

按需填入以下配置：

| 变量 | 说明 |
|------|------|
| `LLM_API_BASE_URL` | LLM API 地址（OpenAI 兼容 `/v1`） |
| `LLM_API_KEY` | LLM API Key |
| `LLM_TEXT_MODEL` | 文生文 / 意图识别模型 |
| `LLM_IMAGE2TEXT_MODEL` | 图生文 / 视觉理解模型 |
| `LLM_IMAGE_MODEL` | 文生图模型 |
| `LLM_VIDEO_MODEL` | 文生视频模型，如 `agnes-video-v2.0` |
| `STT_API_BASE_URL` | 语音转文字 API 地址 |
| `STT_API_KEY` | STT API Key |
| `LLM_STT_MODEL` / `DEFAULT_STT_MODEL` | STT 模型 |
| `AZURE_SPEECH_KEY` | Azure Speech Key（TTS） |
| `AZURE_SPEECH_REGION` | Azure 区域，如 `eastasia` |
| `AZURE_TTS_VOICE` | 播报音色，如 `zh-CN-XiaoxiaoNeural` |
| `QINIU_ACCESS_KEY` | 七牛云 Access Key（图片上传） |
| `QINIU_SECRET_KEY` | 七牛云 Secret Key |
| `QINIU_CDN_BASE_URL` | 七牛 CDN 域名 |
| `QINIU_UPLOAD_HOST` | 七牛上传域名 |
| `NEXT_PUBLIC_BASE_URL` | 站点 URL（元数据与 SEO，可选） |

### 3. 启动开发服务器

```bash
pnpm dev
```

浏览器访问 [http://localhost:3000](http://localhost:3000)。

### 4. 构建与部署

```bash
pnpm build
pnpm start
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 生产构建 |
| `pnpm start` | 启动生产服务 |
| `pnpm lint` | 运行 ESLint |

## 开发说明

- 修改 UI 文案或组件后，若出现 Hydration 警告，可尝试硬刷新或 `rm -rf .next && pnpm dev` 清除 SSR 缓存。
- TTS 需在用户交互（发送 / 点击麦克风 / 切换朗读开关）后调用 `unlockTTS()`，以绕过浏览器自动播放限制。
- TTS 开关状态由 `useTtsEnabled` 管理，默认开启，写入 `localStorage` 键 `tts-enabled`。
- 全局 Toast 由 `app/layout.tsx` 挂载的 `AppToaster` 提供，样式覆盖见 `app/css/sonnerOverrides.css`。
- 语音输入依赖浏览器 `MediaRecorder` API，请使用 HTTPS 或 localhost 环境。
- 图片上传限制与错误文案见 `constants/uploadImage.ts`。
