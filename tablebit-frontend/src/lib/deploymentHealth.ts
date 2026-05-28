import { getSystemHealthScore } from "@/lib/systemHealthEngine";
import { getConnectionState } from "@/lib/realtimeClient";
import { getTimerMetrics } from "@/lib/timerRegistry";
import { getListenerMetrics } from "@/lib/listenerRegistry";

export function runDeploymentHealthCheck(): { passed: boolean; score: number; issues: string[] } {
  const issues: string[] = [];
  const health = getSystemHealthScore();
  const conn = getConnectionState();
  const timers = getTimerMetrics();
  const listeners = getListenerMetrics();

  if (health < 70) issues.push("health below threshold");
  if (conn !== "connected") issues.push("realtime not connected");
  if (timers.stale > 5) issues.push("stale timers detected");
  if (listeners.stale > 5) issues.push("stale listeners detected");

  return { passed: issues.length === 0, score: health, issues };
}

export function getDeploymentHealthMetrics() {
  return runDeploymentHealthCheck();
}
