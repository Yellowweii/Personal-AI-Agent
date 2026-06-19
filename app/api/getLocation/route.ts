import type { GetLocationResponse } from "@/interfaces/getLocation";
import { getClientIp } from "@/lib/getClientIp";

interface IpApiResponse {
  status?: string;
  message?: string;
  country?: string;
  regionName?: string;
  city?: string;
  lat?: number;
  lon?: number;
}

const buildDisplayName = (city: string, region?: string, country?: string) => {
  const parts = [city, region, country].filter(Boolean);
  return parts.join("，");
};

const resolveLocationFromIp = async (
  ip?: string,
): Promise<GetLocationResponse> => {
  const endpoint = ip
    ? `http://ip-api.com/json/${encodeURIComponent(ip)}?lang=zh-CN&fields=status,message,country,regionName,city,lat,lon`
    : "http://ip-api.com/json/?lang=zh-CN&fields=status,message,country,regionName,city,lat,lon";

  const response = await fetch(endpoint, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("定位服务请求失败");
  }

  const data = (await response.json()) as IpApiResponse;
  if (data.status !== "success" || !data.city || data.lat == null || data.lon == null) {
    throw new Error(data.message ?? "无法获取当前位置");
  }

  return {
    city: data.city,
    region: data.regionName,
    country: data.country ?? "",
    lat: data.lat,
    lon: data.lon,
    displayName: buildDisplayName(data.city, data.regionName, data.country),
  };
};

export const GET = async (req: Request) => {
  try {
    const clientIp = getClientIp(req);
    const location = await resolveLocationFromIp(clientIp);
    return Response.json(location satisfies GetLocationResponse);
  } catch (error) {
    console.error("getLocation error:", error);
    return Response.json({ error: "定位失败，请直接说明要查询的城市" }, { status: 500 });
  }
};
