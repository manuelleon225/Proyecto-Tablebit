import { getSystemHealthScore } from "@/lib/systemHealthEngine";
import { getUptimeMetrics } from "@/lib/uptimeMonitor";

export function getRealWorldMetrics() {
  const uptime = getUptimeMetrics();
  return {
    uptime: uptime.availability,
    health: getSystemHealthScore(),
    sessionHours: uptime.uptimeHours,
  };
}
