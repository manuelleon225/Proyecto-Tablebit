import { getKernelState } from "@/lib/runtimeKernel";
import { getConnectionState } from "@/lib/realtimeClient";
import { isSystemDegraded } from "@/lib/systemDegradation";

export function calculatePriority(): "critical" | "high" | "medium" | "low" {
  const kernel = getKernelState();
  if (kernel === "recovering" || kernel === "degraded") return "critical";

  const conn = getConnectionState();
  if (conn === "disconnected") return "high";

  if (document.hidden) return "low";
  if (isSystemDegraded()) return "medium";

  return "high";
}

export function rebalancePriorities(): void {
  calculatePriority();
}
