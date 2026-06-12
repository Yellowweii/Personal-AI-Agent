import type { Asset } from "@/agent/types/memory";

export class AssetStore {
  private assets: Asset[] = [];

  getAssets(): Asset[] {
    return this.assets;
  }

  addAsset(asset: Asset): void {
    const exists = this.assets.some(
      (item) =>
        item.url === asset.url && item.sourceMessageId === asset.sourceMessageId,
    );
    if (!exists) {
      this.assets.push(asset);
    }
  }

  findByMessageId(messageId: string): Asset[] {
    return this.assets.filter((item) => item.sourceMessageId === messageId);
  }

  getLastAsset(type?: Asset["type"]): Asset | undefined {
    const filtered = type
      ? this.assets.filter((item) => item.type === type)
      : this.assets;
    return filtered.at(-1);
  }
}
