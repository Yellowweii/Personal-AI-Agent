import type { Asset, ToolContext } from "@/agent/types/memory";
import type { TaskSpec } from "@/agent/types/plan";

export const buildToolContext = (
  taskSpec: TaskSpec,
  assets: Asset[],
): ToolContext => ({
  taskSpec,
  assets,
});

export const resolveImageUrlForTool = (
  assets: Asset[],
  currentUserImageUrl?: string,
): string | undefined => {
  if (currentUserImageUrl) {
    return currentUserImageUrl;
  }

  const lastImage = [...assets].reverse().find((asset) => asset.type === "image");
  return lastImage?.url;
};
