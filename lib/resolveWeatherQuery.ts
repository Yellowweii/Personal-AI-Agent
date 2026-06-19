import { USE_CURRENT_LOCATION_MARKER } from "@/constants/weather";

const CURRENT_LOCATION_PROMPTS = new Set([
  USE_CURRENT_LOCATION_MARKER,
  "获取当前位置天气",
  "获取用户当前 IP 定位",
]);

const USE_LOCATION_HINTS =
  /当前位置|所在城市|所在地区|用户位置|IP定位|ip定位|CURRENT_LOCATION/i;

/** 从 Task Spec prompt 中剥离常见天气问句噪声，尽量保留地名 */
export const normalizeCityQuery = (prompt: string): string => {
  let query = prompt.trim();

  query = query.replace(
    /^(请|帮我|帮忙|查询|查一下|看看|告诉我|我想知道|我想了解)/,
    "",
  );
  query = query.replace(
    /(的)?(今天|今日|明天|后天|现在|当前|这会|这会儿)?(的)?(天气|气温|温度|下雨|降雨|风力|湿度)(怎么样|如何|情况|状况)?/g,
    "",
  );
  query = query.replace(/[?？!！。,，、\s]+/g, "");

  return query.trim();
};

export const shouldUseStoredLocation = (
  prompt: string,
  hasLocationFromIp: boolean,
): boolean => {
  if (!hasLocationFromIp) {
    return false;
  }

  const trimmed = prompt.trim();
  if (!trimmed || CURRENT_LOCATION_PROMPTS.has(trimmed)) {
    return true;
  }

  return USE_LOCATION_HINTS.test(trimmed);
};

export const resolveCityForWeather = (prompt: string): string | undefined => {
  const trimmed = prompt.trim();
  if (!trimmed || CURRENT_LOCATION_PROMPTS.has(trimmed)) {
    return undefined;
  }

  if (USE_LOCATION_HINTS.test(trimmed)) {
    return undefined;
  }

  const normalized = normalizeCityQuery(trimmed);
  return normalized || undefined;
};
