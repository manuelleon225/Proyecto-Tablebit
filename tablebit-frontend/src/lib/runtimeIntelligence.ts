import { getConnectionState, getReconnectCount, getLatency } from "@/lib/realtimeClient";
import { getSystemHealthScore } from "@/lib/systemHealthEngine";

let forecast: "stable" | "unstable" | "critical" = "stable";

export function analyzeRuntimePatterns(): { reconnects: number; latency: number; health: number; forecast: string } {
  const reconnects = getReconnectCount();
  const latency = getLatency();
  const health = getSystemHealthScore();

  if (reconnects > 5 || latency > 1000 || health < 70) forecast = "unstable";
  else if (health < 40) forecast = "critical";
  else forecast = "stable";

  return { reconnects, latency, health, forecast };
}

export function predictInstability(): boolean {
  const analysis = analyzeRuntimePatterns();
  return analysis.forecast !== "stable";
}

export function getRuntimeForecast(): string {
  analyzeRuntimePatterns();
  return forecast;
}
