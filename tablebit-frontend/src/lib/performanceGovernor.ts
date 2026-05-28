import { isSystemDegraded } from "@/lib/systemDegradation";
import { getConnectionState } from "@/lib/realtimeClient";

let currentPressure: "low" | "medium" | "high" = "low";

export function getPressureLevel(): "low" | "medium" | "high" {
  if (isSystemDegraded()) { currentPressure = "high"; return "high"; }
  const conn = getConnectionState();
  if (conn === "degraded" || conn === "reconnecting") { currentPressure = "medium"; return "medium"; }
  currentPressure = "low";
  return "low";
}

export function getOptimalPollInterval(): number {
  const p = getPressureLevel();
  if (p === "high") return 15000;
  if (p === "medium") return 8000;
  return 3000;
}

export function getOptimalConcurrency(): number {
  const p = getPressureLevel();
  if (p === "high") return 1;
  if (p === "medium") return 2;
  return 4;
}

export function getPerformanceGovernorMetrics() {
  return {
    pressure: getPressureLevel(),
    pollInterval: getOptimalPollInterval(),
    concurrency: getOptimalConcurrency(),
  };
}
