import { getConnectionState, connect } from "@/lib/realtimeClient";
import { isLocked, forceReleaseStaleLocks } from "@/lib/distributedLock";
import { cleanupOrphanTransactions } from "@/lib/runtimeTransaction";
import { getFailoverMode, activateFailover, restoreNormalOperation } from "@/lib/failoverOrchestrator";

let healingCount = 0;
let lastHealing: string | null = null;

export function runSelfHealing(): { repairs: number } {
  let repairs = 0;

  const conn = getConnectionState();
  if (conn === "disconnected") { connect(); repairs++; }

  if (isLocked("realtime-poll")) { forceReleaseStaleLocks(); repairs++; }

  const cleaned = cleanupOrphanTransactions();
  if (cleaned > 0) repairs += cleaned;

  if (repairs > 0) {
    healingCount++;
    lastHealing = new Date().toISOString();
  }

  return { repairs };
}

export function isSystemRecoverable(): boolean {
  return getFailoverMode() !== "emergency";
}

export function getHealingMetrics() {
  return { totalHealings: healingCount, lastHealing, recoverable: isSystemRecoverable() };
}
