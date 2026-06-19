import { execFile } from "node:child_process";
import dns from "node:dns/promises";
import https from "node:https";
import { promisify } from "node:util";
import {
  OPENWEATHERMAP_CURL_TIMEOUT_SEC,
  OPENWEATHERMAP_HOST,
  OPENWEATHERMAP_HTTPS_TIMEOUT_MS,
} from "@/constants/weather";

const execFileAsync = promisify(execFile);

export interface OpenWeatherMapResponse {
  status: number;
  body: string;
}

export interface GeocodedLocation {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
  localName?: string;
}

let cachedIpv4: { address: string; expiresAt: number } | null = null;
let curlAvailableCache: boolean | null = null;

const resolveHostIpv4 = async (): Promise<string> => {
  if (cachedIpv4 && cachedIpv4.expiresAt > Date.now()) {
    return cachedIpv4.address;
  }

  const { address } = await dns.lookup(OPENWEATHERMAP_HOST, { family: 4 });
  cachedIpv4 = {
    address,
    expiresAt: Date.now() + 5 * 60 * 1000,
  };
  return address;
};

const isCurlAvailable = async (): Promise<boolean> => {
  if (curlAvailableCache !== null) {
    return curlAvailableCache;
  }

  try {
    await execFileAsync("curl", ["--version"]);
    curlAvailableCache = true;
  } catch {
    curlAvailableCache = false;
  }

  return curlAvailableCache;
};

const requestViaHttps = (
  path: string,
  signal?: AbortSignal,
  timeoutMs = OPENWEATHERMAP_HTTPS_TIMEOUT_MS,
): Promise<OpenWeatherMapResponse> =>
  new Promise((resolve, reject) => {
    void resolveHostIpv4()
      .then((address) => {
        const request = https.request(
          {
            hostname: address,
            servername: OPENWEATHERMAP_HOST,
            path,
            method: "GET",
            family: 4,
            timeout: timeoutMs,
            headers: {
              Host: OPENWEATHERMAP_HOST,
            },
          },
          (response) => {
            let body = "";
            response.setEncoding("utf8");
            response.on("data", (chunk) => {
              body += chunk;
            });
            response.on("end", () => {
              resolve({
                status: response.statusCode ?? 500,
                body,
              });
            });
          },
        );

        const abort = () => {
          request.destroy(new DOMException("Aborted", "AbortError"));
        };

        if (signal?.aborted) {
          abort();
          return;
        }

        signal?.addEventListener("abort", abort, { once: true });

        request.on("timeout", () => {
          request.destroy(new Error("OpenWeatherMap 请求超时"));
        });

        request.on("error", (error) => {
          signal?.removeEventListener("abort", abort);
          reject(error);
        });

        request.on("close", () => {
          signal?.removeEventListener("abort", abort);
        });

        request.end();
      })
      .catch(reject);
  });

const requestViaCurl = async (path: string): Promise<OpenWeatherMapResponse> => {
  const url = `https://${OPENWEATHERMAP_HOST}${path}`;
  const { stdout } = await execFileAsync(
    "curl",
    [
      "-sS",
      "-m",
      String(OPENWEATHERMAP_CURL_TIMEOUT_SEC),
      "-w",
      "\n__HTTP_STATUS__%{http_code}",
      url,
    ],
    { maxBuffer: 2 * 1024 * 1024 },
  );

  const marker = stdout.lastIndexOf("\n__HTTP_STATUS__");
  if (marker < 0) {
    throw new Error("OpenWeatherMap 响应格式异常");
  }

  const body = stdout.slice(0, marker);
  const status = Number(stdout.slice(marker + 16));

  if (!Number.isFinite(status)) {
    throw new Error("OpenWeatherMap 响应格式异常");
  }

  return { status, body };
};

export const requestOpenWeatherMap = async (
  path: string,
  signal?: AbortSignal,
): Promise<OpenWeatherMapResponse> => {
  if (await isCurlAvailable()) {
    try {
      return await requestViaCurl(path);
    } catch (curlError) {
      console.warn("OpenWeatherMap curl 请求失败，回退 https:", curlError);
    }
  }

  return requestViaHttps(path, signal);
};

export const geocodeOpenWeatherMap = async (
  query: string,
  apiKey: string,
  signal?: AbortSignal,
): Promise<GeocodedLocation[]> => {
  const searchParams = new URLSearchParams({
    q: query,
    limit: "1",
    appid: apiKey,
  });

  const { status, body } = await requestOpenWeatherMap(
    `/geo/1.0/direct?${searchParams.toString()}`,
    signal,
  );

  if (status !== 200) {
    return [];
  }

  const parsed = JSON.parse(body) as Array<{
    name?: string;
    lat?: number;
    lon?: number;
    country?: string;
    state?: string;
    local_names?: { zh?: string };
  }>;

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed
    .filter(
      (
        item,
      ): item is Required<
        Pick<GeocodedLocation, "name" | "lat" | "lon" | "country">
      > & {
        state?: string;
        local_names?: { zh?: string };
      } =>
        typeof item.name === "string" &&
        typeof item.lat === "number" &&
        typeof item.lon === "number" &&
        typeof item.country === "string",
    )
    .map((item) => ({
      name: item.name,
      lat: item.lat,
      lon: item.lon,
      country: item.country,
      state: item.state,
      localName: item.local_names?.zh,
    }));
};
