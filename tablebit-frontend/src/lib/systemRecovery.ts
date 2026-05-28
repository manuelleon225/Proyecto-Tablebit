import { connect, disconnect } from "@/lib/realtimeClient";
import { initLeaderElection } from "@/lib/realtimeLeader";
import { startPresenceSync } from "@/lib/presenceSync";
import { repairCaches } from "@/lib/cacheConsistency";

let recoveryAttempts = 0;
let recoverySuccess = true;
let lastRecovery: string | null = null;

export function recoverRealtime(): void {
  disconnect();
  setTimeout(() => {
    connect();
    initLeaderElection();
    startPresenceSync();
  }, 500);
}

export async function recoverPWA(): Promise<void> {
  await repairCaches();
}

export function emergencyRecovery(): void {
  recoverRealtime();
  recoveryAttempts++;
  lastRecovery = new Date().toISOString();
}

export function getRecoveryMetrics() {
  return { attempts: recoveryAttempts, lastRecovery, successRate: recoverySuccess ? 100 : 0 };
}
