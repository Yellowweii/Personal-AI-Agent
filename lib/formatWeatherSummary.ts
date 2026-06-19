interface OpenWeatherMain {
  temp?: number;
  feels_like?: number;
  humidity?: number;
}

interface OpenWeatherWind {
  speed?: number;
}

interface OpenWeatherWeatherItem {
  description?: string;
}

export interface OpenWeatherCurrentResponse {
  name?: string;
  main?: OpenWeatherMain;
  weather?: OpenWeatherWeatherItem[];
  wind?: OpenWeatherWind;
}

export const formatWeatherSummary = (
  data: OpenWeatherCurrentResponse,
  locationLabel?: string,
): string => {
  const location = locationLabel ?? data.name ?? "未知地点";
  const temp = data.main?.temp;
  const feelsLike = data.main?.feels_like;
  const humidity = data.main?.humidity;
  const description = data.weather?.[0]?.description ?? "未知";
  const windSpeed = data.wind?.speed;

  const lines = [`地点：${location}`];

  if (typeof temp === "number") {
    lines.push(`气温：${Math.round(temp)}°C`);
  }

  if (typeof feelsLike === "number") {
    lines.push(`体感：${Math.round(feelsLike)}°C`);
  }

  lines.push(`天气：${description}`);

  if (typeof humidity === "number") {
    lines.push(`湿度：${humidity}%`);
  }

  if (typeof windSpeed === "number") {
    lines.push(`风速：${windSpeed} m/s`);
  }

  return lines.join("\n");
};
