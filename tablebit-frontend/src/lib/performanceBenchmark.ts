import { getLatency } from "@/lib/realtimeClient";
import { getSystemHealthScore } from "@/lib/systemHealthEngine";

export function runPerformanceBenchmark() {
  return {
    realtimeLatency: getLatency(),
    healthScore: getSystemHealthScore(),
    timestamp: new Date().toISOString(),
  };
}
