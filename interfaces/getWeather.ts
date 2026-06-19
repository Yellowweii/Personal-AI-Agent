export interface GetWeatherRequest {
  city?: string;
  lat?: number;
  lon?: number;
}

export interface GetWeatherResponse {
  location: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  description: string;
  windSpeed: number;
  summary: string;
}
