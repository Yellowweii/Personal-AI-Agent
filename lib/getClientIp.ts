const isPrivateIp = (ip: string): boolean => {
  if (ip === "::1" || ip === "127.0.0.1") {
    return true;
  }

  if (ip.startsWith("10.") || ip.startsWith("192.168.")) {
    return true;
  }

  const parts = ip.split(".");
  if (parts[0] === "172") {
    const second = Number(parts[1]);
    if (second >= 16 && second <= 31) {
      return true;
    }
  }

  return false;
};

export const getClientIp = (req: Request): string | undefined => {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const ip = forwarded.split(",")[0]?.trim();
    if (ip && !isPrivateIp(ip)) {
      return ip;
    }
  }

  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp && !isPrivateIp(realIp)) {
    return realIp;
  }

  return undefined;
};
