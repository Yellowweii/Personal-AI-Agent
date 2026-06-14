import type { Asset, MemoryFact } from "@/agent/types/memory";

export const formatAssetsBlock = (assets: Asset[]): string => {
  if (assets.length === 0) {
    return "（无）";
  }

  return JSON.stringify(
    assets.map((asset) => ({
      id: asset.id,
      type: asset.type,
      summary: asset.summary,
      url: asset.url,
    })),
    null,
    2,
  );
};

export const formatMemoriesBlock = (memories: MemoryFact[]): string => {
  if (memories.length === 0) {
    return "（无）";
  }

  return memories
    .map((memory) => `- ${memory.key}: ${memory.value}`)
    .join("\n");
};

export const formatSystemContextBlock = (sections: {
  summary?: string;
  longTermMemories?: MemoryFact[];
  assets?: Asset[];
}): string => {
  const parts: string[] = ["# Context", ""];

  if (sections.summary) {
    parts.push("Conversation Summary:");
    parts.push(sections.summary);
    parts.push("");
  }

  if (sections.longTermMemories) {
    parts.push("Long Term Memory:");
    parts.push(formatMemoriesBlock(sections.longTermMemories));
    parts.push("");
  }

  if (sections.assets) {
    parts.push("Assets:");
    parts.push(formatAssetsBlock(sections.assets));
  }

  return parts.join("\n").trim();
};
