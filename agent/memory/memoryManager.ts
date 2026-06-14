import type { BuiltContext, ContextPool, MemoryFact, ToolContext } from "@/agent/types/memory";
import type { Message } from "@/agent/types/message";
import type { TaskSpec } from "@/agent/types/plan";
import { buildContextPool } from "@/agent/memory/contextBuilder/buildContextPool";
import { selectIntentContext } from "@/agent/memory/contextSelection/selectIntentContext";
import { selectTaskSpecContext } from "@/agent/memory/contextSelection/selectTaskSpecContext";
import { selectToolContext } from "@/agent/memory/contextSelection/selectToolContext";
import { summarizeMessages } from "@/agent/memory/summary/summarizeMessages";
import { extractAssetsFromMessage } from "@/agent/memory/summary/extractAssetsFromMessage";
import { AssetStore } from "@/agent/memory/store/assetStore";
import { ConversationStore } from "@/agent/memory/store/conversationStore";
import { MemoryStore } from "@/agent/memory/store/memoryStore";
import { SUMMARY_BATCH_SIZE } from "@/constants/memory";
import {
  getMessageImageUrl,
  getMessageText,
  hasUserImage,
} from "@/lib/messageContent";

export class MemoryManager {
  private conversationStore = new ConversationStore();

  private assetStore = new AssetStore();

  private memoryStore = new MemoryStore();

  private conversationSummary = "";

  private summarizedBatchCount = 0;

  private syncedMessageIds = new Set<string>();

  async syncMessages(messages: Message[], signal?: AbortSignal): Promise<void> {
    this.conversationStore.setMessages(messages);

    await this.syncNewAssets(messages, signal);

    const batchCount = Math.floor(messages.length / SUMMARY_BATCH_SIZE);
    const assets = this.assetStore.getAssets();

    if (batchCount === 0) {
      this.conversationSummary = "";
      this.summarizedBatchCount = 0;
      return;
    }

    for (
      let batch = this.summarizedBatchCount + 1;
      batch <= batchCount;
      batch += 1
    ) {
      const batchStart = (batch - 1) * SUMMARY_BATCH_SIZE;
      const batchMessages = messages.slice(
        batchStart,
        batchStart + SUMMARY_BATCH_SIZE,
      );

      const summary = await summarizeMessages({
        messages: batchMessages,
        assets,
        previousSummary: batch > 1 ? this.conversationSummary : undefined,
        signal,
      });

      this.conversationSummary = summary;
    }

    this.summarizedBatchCount = batchCount;
  }

  private async syncNewAssets(
    messages: Message[],
    signal?: AbortSignal,
  ): Promise<void> {
    for (const message of messages) {
      if (this.syncedMessageIds.has(message.id)) {
        continue;
      }

      const assets = await extractAssetsFromMessage(message, signal);
      for (const asset of assets) {
        this.assetStore.addAsset(asset);
      }

      this.syncedMessageIds.add(message.id);
    }
  }

  clear(): void {
    this.conversationStore.setMessages([]);
    this.assetStore = new AssetStore();
    this.memoryStore.setMemories([]);
    this.conversationSummary = "";
    this.summarizedBatchCount = 0;
    this.syncedMessageIds.clear();
  }

  addMemory(fact: MemoryFact): void {
    this.memoryStore.addMemory(fact);
  }

  buildContextPool(): ContextPool {
    return buildContextPool({
      messages: this.conversationStore.getMessages(),
      summarizedBatchCount: this.summarizedBatchCount,
      conversationSummary: this.conversationSummary,
      longTermMemories: this.memoryStore.getMemories(),
      assets: this.assetStore.getAssets(),
    });
  }

  buildIntentContext(): BuiltContext {
    return selectIntentContext(this.buildContextPool());
  }

  buildTaskSpecContext(): BuiltContext {
    return selectTaskSpecContext(this.buildContextPool());
  }

  buildToolContext(taskSpec: TaskSpec): ToolContext {
    return selectToolContext(
      taskSpec,
      this.assetStore.getAssets(),
      taskSpec.tool === "image_understanding"
        ? this.getLatestUserImageUrl()
        : undefined,
    );
  }

  private getLatestUserMessage(): Message | undefined {
    const messages = this.conversationStore.getMessages();
    return [...messages].reverse().find((message) => message.role === "user");
  }

  latestUserHasText(): boolean {
    const latestUser = this.getLatestUserMessage();
    return Boolean(latestUser && getMessageText(latestUser).trim());
  }

  getLatestUserText(): string {
    const latestUser = this.getLatestUserMessage();
    return latestUser ? getMessageText(latestUser) : "";
  }

  getLatestUserImageUrl(): string | undefined {
    const latestUser = this.getLatestUserMessage();
    return latestUser ? getMessageImageUrl(latestUser) : undefined;
  }

  latestUserHasImage(): boolean {
    const latestUser = this.getLatestUserMessage();
    return latestUser ? hasUserImage(latestUser) : false;
  }
}
