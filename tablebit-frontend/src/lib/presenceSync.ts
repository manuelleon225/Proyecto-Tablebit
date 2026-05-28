import api from "@/services/api";
import { connect } from "@/lib/realtimeClient";

let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let failCount = 0;
let recoveryCount = 0;
const HEARTBEAT_INTERVAL = 15000;
const MAX_FAILURES = 3;
const HEARTBEAT_CHANNEL = "presence";

export function startPresenceSync(): void {
  if (heartbeatTimer) return;
  heartbeatTimer = setInterval(async () => {
    try {
      await api.get("/realtime/poll", { params: { channel: HEARTBEAT_CHANNEL } });
      failCount = 0;
    } catch {
      failCount++;
      if (failCount >= MAX_FAILURES) {
        recoveryCount++;
        connect();
        failCount = 0;
      }
    }
  }, HEARTBEAT_INTERVAL);
}

export function stopPresenceSync(): void {
  if (heartbeatTimer) { clearInterval(heartbeatTimer); heartbeatTimer = null; }
}

export function getPresenceMetrics() {
  return {
    active: heartbeatTimer !== null,
    interval: HEARTBEAT_INTERVAL,
    heartbeatFailures: failCount,
    recoveries: recoveryCount,
  };
}
