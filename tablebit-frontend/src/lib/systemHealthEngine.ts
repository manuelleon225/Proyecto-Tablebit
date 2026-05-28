import { getConnectionState, getReconnectCount, getLatency } from "@/lib/realtimeClient";
import { isSystemDegraded } from "@/lib/systemDegradation";

export function getSystemHealthScore(): number {
  let score = 100;

  const conn = getConnectionState();
  if (conn === "disconnected") score -= 30;
  else if (conn === "degraded") score -= 20;
  else if (conn === "reconnecting") score -= 10;

  const reconnects = getReconnectCount();
  if (reconnects > 10) score -= 15;
  else if (reconnects > 5) score -= 5;

  if (getLatency() > 2000) score -= 10;
  else if (getLatency() > 1000) score -= 5;

  if (isSystemDegraded()) score -= 10;

  return Math.max(0, Math.min(100, score));
}

export function getHealthLevel(score: number): string {
  if (score >= 90) return "healthy";
  if (score >= 70) return "degraded";
  if (score >= 40) return "unstable";
  return "critical";
}
