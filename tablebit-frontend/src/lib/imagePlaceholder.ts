export function generateBlurDataUrl(color = "#cbd5e1"): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="${encodeURIComponent(color)}"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const DEFAULT_BLUR = generateBlurDataUrl("#e2e8f0");

export function getDominantColorFromUrl(_url: string): string {
  return "#cbd5e1";
}

export type ConnectionType = "slow-2g" | "2g" | "3g" | "4g" | "fast";

const connectionCache = { type: null as ConnectionType | null };

export function getConnectionType(): ConnectionType {
  if (connectionCache.type) return connectionCache.type;
  if (typeof navigator === "undefined") return "fast";
  const conn = (navigator as any).connection;
  if (!conn) return "fast";
  if (conn.saveData || conn.effectiveType === "slow-2g" || conn.effectiveType === "2g") {
    connectionCache.type = "slow-2g";
    return "slow-2g";
  }
  if (conn.effectiveType === "3g") { connectionCache.type = "3g"; return "3g"; }
  connectionCache.type = "fast";
  return "fast";
}

export function isSaveDataEnabled(): boolean {
  if (typeof navigator === "undefined") return false;
  const conn = (navigator as any).connection;
  return conn?.saveData === true;
}

export function isLowEndDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  if (navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 4) return true;
  if ((navigator as any).deviceMemory !== undefined && (navigator as any).deviceMemory <= 2) return true;
  return false;
}

export function getOptimalMaxWidth(): number {
  if (isLowEndDevice()) return isSaveDataEnabled() ? 320 : 640;
  const conn = getConnectionType();
  if (conn === "slow-2g") return 320;
  if (conn === "2g") return 640;
  if (conn === "3g") return 1280;
  return 1920;
}

export function getOptimalQuality(): number {
  if (isLowEndDevice() || isSaveDataEnabled()) return 0.6;
  const conn = getConnectionType();
  if (conn === "slow-2g" || conn === "2g") return 0.6;
  if (conn === "3g") return 0.75;
  return 0.9;
}
