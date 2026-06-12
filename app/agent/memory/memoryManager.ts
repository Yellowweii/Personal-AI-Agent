import type {
  Asset,
  BuiltContext,
  ContextPool,
  ConversationSummary,
  MemoryFact,
  ToolContext,
} from "@/agent/memory/types";
import type { Message } from "@/agent/types/message";
import type { TaskSpec } from "@/agent/types/plan";
import { buildIntentContext } from "@/agent/memory/context/buildIntentContext";
import { buildTaskSpecContext } from "@/agent/memory/context/buildTaskSpecContext";
import {
  buildToolContext,
  resolveImageUrlForTool,
} from "@/agent/memory/context/buildToolContext";
import { getLastAssets } from "@/agent/memory/retrieval/getLastAssets";
import { getMemories } from "@/agent/memory/retrieval/getMemories";
import { getRecentMessages } from "@/agent/memory/retrieval/getRecentMessages";
import { getSummary } from "@/agent/memory/retrieval/getSummary";
import { summarizeMessages } from "@/agent/memory/summary/summarizeMessages";
import { extractAssetsFromMessages } from "@/agent/memory/summary/extractAssetsFromMessage";
import { AssetStore } from "@/agent/memory/store/assetStore";
import { ConversationStore } from "@/agent/memory/store/conversationStore";
import { MemoryStore } from "@/agent/memory/store/memoryStore";
import { SUMMARY_BATCH_SIZE } from "@/constants/memory";
import { getMessageText, hasUserImage } from "@/lib/messageContent";

export class MemoryManager {
  private conversationStore = new ConversationStore();

  private assetStore = new AssetStore();

  private memoryStore = new MemoryStore();

  private conversationSummary: ConversationSummary | null = null;

  /** 已完成滚动压缩的批次数（每批 SUMMARY_BATCH_SIZE 条） */
  private summarizedBatchCount = 0;

  async syncMessages(messages: Message[], signal?: AbortSignal): Promise<void> {
    this.conversationStore.setMessages(messages);

    const extractedAssets = extractAssetsFromMessages(messages);
    for (const asset of extractedAssets) {
      this.assetStore.addAsset(asset);
    }

    const batchCount = Math.floor(messages.length / SUMMARY_BATCH_SIZE);
    const assets = this.assetStore.getAssets();

    if (batchCount === 0) {
      this.conversationSummary = null;
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
        previousSummary:
          batch > 1 ? this.conversationSummary?.summary : undefined,
        signal,
      });

      this.conversationSummary = { summary };
    }

    this.summarizedBatchCount = batchCount;
  }

  clear(): void {
    this.conversationStore.setMessages([]);
    this.assetStore = new AssetStore();
    this.memoryStore.setMemories([]);
    this.conversationSummary = null;
    this.summarizedBatchCount = 0;
  }

  addMemory(fact: MemoryFact): void {
    this.memoryStore.addMemory(fact);
  }

  updateAssetSummary(assetId: string, summary: string): void {
    this.assetStore.updateSummary(assetId, summary);
  }

  updateAssetSummaryByUrl(url: string, summary: string): void {
    const asset = this.assetStore
      .getAssets()
      .find((item) => item.url === url);
    if (asset) {
      this.assetStore.updateSummary(asset.id, summary);
    }
  }

  getAssets(): Asset[] {
    return this.assetStore.getAssets();
  }

  buildContextPool(): ContextPool {
    const messages = this.conversationStore.getMessages();
    const latestUser = [...messages].reverse().find((m) => m.role === "user");
    const summarizedCount = this.summarizedBatchCount * SUMMARY_BATCH_SIZE;

    return {
      currentMessage: latestUser ? getMessageText(latestUser) : "",
      recentMessages: getRecentMessages(messages, summarizedCount),
      summary: getSummary(this.conversationSummary),
      memories: getMemories(this.memoryStore),
      assets: getLastAssets(this.assetStore),
    };
  }

  buildIntentContext(): BuiltContext {
    return buildIntentContext(this.buildContextPool());
  }

  buildTaskSpecContext(): BuiltContext {
    return buildTaskSpecContext(this.buildContextPool());
  }

  buildToolContext(taskSpec: TaskSpec): ToolContext {
    return buildToolContext(taskSpec, getLastAssets(this.assetStore));
  }

  resolveImageUrl(currentUserImageUrl?: string): string | undefined {
    return resolveImageUrlForTool(
      this.assetStore.getAssets(),
      currentUserImageUrl,
    );
  }

  latestUserHasImage(): boolean {
    const messages = this.conversationStore.getMessages();
    const latestUser = [...messages].reverse().find((m) => m.role === "user");
    return latestUser ? hasUserImage(latestUser) : false;
  }
}
