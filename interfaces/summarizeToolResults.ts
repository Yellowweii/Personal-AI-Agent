import type { GetLocationResponse } from "@/interfaces/getLocation";
import type { GetWeatherResponse } from "@/interfaces/getWeather";

export interface SummarizeToolResultsRequest {
  userMessage: string;
  get_location?: GetLocationResponse;
  get_weather?: GetWeatherResponse;
}
