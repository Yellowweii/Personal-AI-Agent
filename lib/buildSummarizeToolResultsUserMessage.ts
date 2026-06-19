import type { ToolResults } from "@/agent/executor/executeTaskSpec";

export const buildSummarizeToolResultsUserMessage = (
  userMessage: string,
  toolResults: ToolResults,
): string => {
  const sections = [`用户问题：${userMessage.trim() || "（无）"}`, "", "工具返回数据："];

  if (toolResults.get_location) {
    sections.push(
      "【定位】",
      JSON.stringify(toolResults.get_location, null, 2),
      "",
    );
  }

  if (toolResults.get_weather) {
    sections.push(
      "【天气】",
      JSON.stringify(toolResults.get_weather, null, 2),
    );
  }

  return sections.join("\n").trim();
};
