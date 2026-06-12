<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Communication

- When handling user tasks, prefer Chinese for explanations, summaries, and progress updates. Keep code comments, identifiers, and commit messages aligned with existing project conventions.

## Code organization

按功能模块拆分文件，便于查找和维护。新增或重构代码时遵循以下约定：

- **agent/types/**：Agent 领域模型（如 `message.ts`、`plan.ts`）。跨层复用的核心数据结构放这里。
- **interfaces/**：对外边界类型，按功能模块一文件（如 `chat.ts`、`textToSpeech.ts`、`generateTaskSpecs.ts`）。仅放 API 请求/响应、Hook 返回类型等契约，不放 Agent 领域模型。不要在组件、hooks 或 API 路由内内联定义可复用类型。
- **constants/**：所有常量，按功能模块一文件（如 `ui.ts`、`textToSpeech.ts`）。魔法字符串、默认配置等放对应模块文件。
- **constants/systemPrompts.ts**：所有 system prompt 一律集中在此文件，不论属于哪个功能模块（如意图识别、文生图、文生视频）。不要在其他 constants 文件或 API 路由内内联定义。
- **svgs/**：所有 SVG 图标组件，按功能模块一文件（如 `chat.tsx`、`speechToText.tsx`）。页面内联 SVG 应提取到此目录。

- **agent/memory/**：Memory 与 Context Builder（如 `memoryManager.ts`、`buildIntentContext.ts`、`assetStore.ts`）。store / summary / retrieval / context 子目录同样按能力拆分。

命名与现有文件保持一致：文件名与模块/能力对应，**一律使用 camelCase**（如 `memoryManager.ts`、`extractAssetsFromMessage.ts`），禁止使用 kebab-case（如 `memory-manager.ts`）。领域类型从 `@/agent/types/*` 导入；API / Hook 契约从 `@/interfaces/*`；常量从 `@/constants/*`；图标从 `@/svgs/*` 导入。
