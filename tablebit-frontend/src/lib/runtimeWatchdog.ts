import { getConnectionState, getReconnectCount } from "@/lib/realtimeClient";
import { getTimerMetrics } from "@/lib/timerRegistry";
import { getListenerMetrics } from "@/lib/listenerRegistry";
import { getCleanupMetrics } from "@/lib/memoryCleanup";

let overlapsPrevented = 0;
let active = false;

export function startRuntimeWatchdog(): void {
  if (active) return;
  active = true;

  setInterval(() => {
    const conn = getConnectionState();
    const reconnects = getReconnectCount();
    const timers = getTimerMetrics();
    const listeners = getListenerMetrics();

    if (timers.stale > 5) overlapsPrevented++;
    if (listeners.stale > 5) overlapsPrevented++;
    if (reconnects > 10 && conn !== "disconnected") overlapsPrevented++;

  }, 30000);
}

export function stopRuntimeWatchdog(): void { active = false; }

export function getRuntimeMetrics() {
  return {
    active,
    overlapsPrevented,
    timers: getTimerMetrics(),
    listeners: getListenerMetrics(),
    cleanup: getCleanupMetrics(),
  };
}
