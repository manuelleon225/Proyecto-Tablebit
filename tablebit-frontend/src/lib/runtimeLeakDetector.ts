import { getTimerMetrics } from "@/lib/timerRegistry";
import { getListenerMetrics } from "@/lib/listenerRegistry";

export function detectMemoryLeaks(): { healthy: boolean; leaks: string[]; severity: "low" | "medium" | "critical" } {
  const leaks: string[] = [];
  const timers = getTimerMetrics();
  const listeners = getListenerMetrics();

  if (timers.total > 50) leaks.push(`excessive timers: ${timers.total}`);
  if (timers.stale > 10) leaks.push(`stale timers: ${timers.stale}`);
  if (listeners.total > 50) leaks.push(`excessive listeners: ${listeners.total}`);
  if (listeners.stale > 10) leaks.push(`stale listeners: ${listeners.stale}`);

  const severity = leaks.length > 3 ? "critical" : leaks.length > 1 ? "medium" : "low";
  return { healthy: leaks.length === 0, leaks, severity };
}
