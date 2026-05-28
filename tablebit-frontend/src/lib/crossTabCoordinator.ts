import { broadcastEvent, listenForEvents } from "@/lib/pwaBroadcast";
import { acquireLock, releaseLock } from "@/lib/distributedLock";

const SYNC_INTERVAL = 15000;
const LOCK_NAME = "cross-tab-sync";

let active = false;
let lastSync: string | null = null;

export function startCrossTabCoordination(): void {
  if (active) return;
  active = true;

  listenForEvents((event) => {
    if (event.data?.type === "cross-tab-sync-request") {
      if (acquireLock(LOCK_NAME, 5000)) {
        broadcastEvent("cross-tab-sync-response", { timestamp: Date.now() });
        releaseLock(LOCK_NAME);
      }
    }
  });

  setInterval(() => {
    broadcastEvent("cross-tab-sync-request", { timestamp: Date.now() });
    lastSync = new Date().toISOString();
  }, SYNC_INTERVAL);
}

export function stopCrossTabCoordination(): void { active = false; }
export function getCrossTabMetrics() {
  return { active, lastSync };
}
