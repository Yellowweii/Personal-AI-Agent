import type { Asset, ToolContext } from "@/agent/types/memory";
import type { TaskSpec } from "@/agent/types/plan";

export const selectToolContext = (
  taskSpec: TaskSpec,
  assets: Asset[],
  currentUserImageUrl?: string,
): ToolContext => ({
  taskSpec,
  assets,
  currentUserImageUrl,
});

export const resolveImageUrlForTool = (
  assets: Asset[],
  currentUserImageUrl?: string,
): string | undefined => {
  if (currentUserImageUrl) {
    return currentUserImageUrl;
  }

  const lastImage = [...assets]
    .reverse()
    .find((asset) => asset.type === "image");
  return lastImage?.url;
};
