import { getSystemHealthScore } from "@/lib/systemHealthEngine";
import { getConnectionState, getLatency, getReconnectCount } from "@/lib/realtimeClient";
import { getDeploymentMetrics } from "@/lib/deploymentManager";
import { isPlatformFrozen } from "@/lib/platformFreeze";

export function getProductionMetrics() {
  return {
    health: getSystemHealthScore(),
    realtime: getConnectionState(),
    latency: getLatency(),
    reconnects: getReconnectCount(),
    deployment: getDeploymentMetrics(),
    platformFrozen: isPlatformFrozen(),
  };
}

export function validateProductionState(): { healthy: boolean; issues: string[] } {
  const issues: string[] = [];
  const m = getProductionMetrics();

  if (m.health < 70) issues.push(`health: ${m.health}`);
  if (m.realtime !== "connected") issues.push("realtime disconnected");
  if (!m.platformFrozen) issues.push("platform not frozen");

  return { healthy: issues.length === 0, issues };
}
