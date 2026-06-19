export interface GetLocationResponse {
  city: string;
  region?: string;
  country: string;
  lat: number;
  lon: number;
  displayName: string;
}
