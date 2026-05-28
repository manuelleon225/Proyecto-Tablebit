import { forceReleaseStaleLocks } from "@/lib/distributedLock";
import { cleanupOrphanTransactions } from "@/lib/runtimeTransaction";

let active = false;
let staleLocksFreed = 0;
let orphanTxCleaned = 0;

export function startConsistencyWatchdog(): void {
  if (active) return;
  active = true;

  setInterval(() => {
    staleLocksFreed += forceReleaseStaleLocks();
    orphanTxCleaned += cleanupOrphanTransactions();
  }, 60000);
}

export function getConsistencyMetrics() {
  return { active, staleLocksFreed, orphanTxCleaned };
}
