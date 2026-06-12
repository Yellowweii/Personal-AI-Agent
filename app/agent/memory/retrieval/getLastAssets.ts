import type { Asset } from "@/agent/types/memory";
import type { AssetStore } from "@/agent/memory/store/assetStore";

export const getLastAssets = (assetStore: AssetStore): Asset[] =>
  assetStore.getAssets();

export const getLastImageAsset = (
  assetStore: AssetStore,
): Asset | undefined => assetStore.getLastAsset("image");

export const getLastVideoAsset = (
  assetStore: AssetStore,
): Asset | undefined => assetStore.getLastAsset("video");
