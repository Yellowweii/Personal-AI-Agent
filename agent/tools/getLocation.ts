import type { GetLocationResponse } from "@/interfaces/getLocation";

export const getLocation = async (
  signal?: AbortSignal,
): Promise<GetLocationResponse> => {
  const response = await fetch("/api/getLocation", {
    method: "GET",
    signal,
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(data?.error ?? "定位失败，请直接说明要查询的城市");
  }

  return response.json();
};
