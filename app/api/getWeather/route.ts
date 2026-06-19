import type { GetWeatherRequest } from "@/interfaces/getWeather";
import type { GetWeatherResponse } from "@/interfaces/getWeather";
import {
  formatWeatherSummary,
  type OpenWeatherCurrentResponse,
} from "@/lib/formatWeatherSummary";
import {
  geocodeOpenWeatherMap,
  requestOpenWeatherMap,
} from "@/lib/openWeatherMap";
import { normalizeCityQuery } from "@/lib/resolveWeatherQuery";

const buildWeatherQuery = (lat: number, lon: number): URLSearchParams =>
  new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    units: "metric",
    lang: "zh_cn",
  });

const mapOpenWeatherMapError = (status: number, body: string): string => {
  if (status === 401) {
    return "OpenWeatherMap API Key 无效或未激活，请检查密钥是否正确（新 Key 可能需要等待数小时生效）";
  }

  if (status === 404) {
    return "未找到该地点，请尝试更具体的城市名称";
  }

  if (status === 429) {
    return "天气查询次数已达上限，请稍后再试";
  }

  try {
    const parsed = JSON.parse(body) as { message?: string };
    if (parsed.message?.trim()) {
      return parsed.message;
    }
  } catch {
    // ignore parse errors
  }

  return "天气查询失败，请稍后重试";
};

const resolveCoordinates = async (
  body: GetWeatherRequest,
  apiKey: string,
  signal?: AbortSignal,
): Promise<{ lat: number; lon: number; locationLabel: string }> => {
  if (body.lat != null && body.lon != null) {
    return {
      lat: body.lat,
      lon: body.lon,
      locationLabel: body.city?.trim() || "当前位置",
    };
  }

  const rawCity = body.city?.trim();
  if (!rawCity) {
    throw new Error("缺少查询地点");
  }

  const candidates = [rawCity, normalizeCityQuery(rawCity)].filter(
    (value, index, array) => value && array.indexOf(value) === index,
  );

  for (const query of candidates) {
    const geocoded = await geocodeOpenWeatherMap(query, apiKey, signal);
    if (geocoded.length === 0) {
      continue;
    }

    const [location] = geocoded;
    const locationLabel =
      location.localName ??
      [location.name, location.state, location.country]
        .filter(Boolean)
        .join("，");

    return {
      lat: location.lat,
      lon: location.lon,
      locationLabel,
    };
  }

  throw new Error("未找到该地点，请尝试更具体的城市名称");
};

export const POST = async (req: Request) => {
  try {
    const body = (await req.json()) as GetWeatherRequest;
    const apiKey = process.env.OPENWEATHERMAP_API_KEY?.trim();

    if (!apiKey) {
      return Response.json({ error: "未配置 OpenWeatherMap API Key" }, { status: 500 });
    }

    const hasCoordinates = body.lat != null && body.lon != null;
    const hasCity = Boolean(body.city?.trim());

    if (!hasCoordinates && !hasCity) {
      return Response.json({ error: "缺少查询地点" }, { status: 400 });
    }

    const { lat, lon, locationLabel } = await resolveCoordinates(
      body,
      apiKey,
      req.signal,
    );

    const query = buildWeatherQuery(lat, lon);
    query.set("appid", apiKey);

    const { status, body: responseBody } = await requestOpenWeatherMap(
      `/data/2.5/weather?${query.toString()}`,
      req.signal,
    );

    if (status !== 200) {
      console.error("OpenWeatherMap error:", status, responseBody);
      return Response.json(
        { error: mapOpenWeatherMapError(status, responseBody) },
        { status },
      );
    }

    const data = JSON.parse(responseBody) as OpenWeatherCurrentResponse;
    const summary = formatWeatherSummary(data, locationLabel);

    const result: GetWeatherResponse = {
      location: locationLabel,
      temp: data.main?.temp ?? 0,
      feelsLike: data.main?.feels_like ?? 0,
      humidity: data.main?.humidity ?? 0,
      description: data.weather?.[0]?.description ?? "未知",
      windSpeed: data.wind?.speed ?? 0,
      summary,
    };

    return Response.json(result);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    if (error instanceof Error && error.message.includes("未找到该地点")) {
      return Response.json({ error: error.message }, { status: 404 });
    }

    if (error instanceof Error && error.message.includes("请求超时")) {
      return Response.json(
        { error: "连接 OpenWeatherMap 超时，请稍后重试" },
        { status: 504 },
      );
    }

    console.error("getWeather error:", error);
    return Response.json({ error: "天气查询失败，请稍后重试" }, { status: 500 });
  }
};
