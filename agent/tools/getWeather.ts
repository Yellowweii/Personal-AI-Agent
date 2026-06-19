import type { GetLocationResponse } from "@/interfaces/getLocation";
import type { GetWeatherRequest } from "@/interfaces/getWeather";
import type { GetWeatherResponse } from "@/interfaces/getWeather";
import {
  resolveCityForWeather,
  shouldUseStoredLocation,
} from "@/lib/resolveWeatherQuery";

export interface GetWeatherOptions {
  prompt: string;
  location?: GetLocationResponse;
  signal?: AbortSignal;
}

const resolveWeatherRequest = (
  prompt: string,
  location?: GetLocationResponse,
): GetWeatherRequest => {
  if (shouldUseStoredLocation(prompt, Boolean(location))) {
    if (!location) {
      throw new Error("缺少查询地点，请说明要查询的城市");
    }

    return {
      city: location.city,
      lat: location.lat,
      lon: location.lon,
    };
  }

  const city = resolveCityForWeather(prompt);
  if (city) {
    return { city };
  }

  if (location) {
    return {
      city: location.city,
      lat: location.lat,
      lon: location.lon,
    };
  }

  throw new Error("缺少查询地点，请说明要查询的城市");
};

export const getWeather = async (
  options: GetWeatherOptions,
): Promise<GetWeatherResponse> => {
  const body = resolveWeatherRequest(options.prompt, options.location);

  const response = await fetch("/api/getWeather", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: options.signal,
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(data?.error ?? "天气查询失败，请稍后重试");
  }

  return response.json();
};
