import { getConnectionState } from "@/lib/realtimeClient";
import { isSystemDegraded } from "@/lib/systemDegradation";

export function getReconciliationInterval(): number {
  if (isSystemDegraded()) return 120000;
  const conn = getConnectionState();
  if (conn === "degraded" || conn === "reconnecting") return 60000;
  return 30000;
}

export function getLockTTL(): number {
  if (isSystemDegraded()) return 60000;
  return 30000;
}

export function getGovernorMetrics() {
  return {
    reconciliationInterval: getReconciliationInterval(),
    lockTTL: getLockTTL(),
  };
}
