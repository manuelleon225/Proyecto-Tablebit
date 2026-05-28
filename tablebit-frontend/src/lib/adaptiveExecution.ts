import { getSystemHealthScore } from "@/lib/systemHealthEngine";
import { getKernelState } from "@/lib/runtimeKernel";

export function getAdaptivePollingInterval(): number {
  const health = getSystemHealthScore();
  const kernel = getKernelState();
  if (kernel === "recovering" || health < 40) return 15000;
  if (health < 70) return 8000;
  return 3000;
}

export function getAdaptiveHealingInterval(): number {
  const health = getSystemHealthScore();
  if (health < 40) return 10000;
  if (health < 70) return 30000;
  return 60000;
}

export function getAdaptiveExecutionMetrics() {
  return {
    polling: getAdaptivePollingInterval(),
    healing: getAdaptiveHealingInterval(),
  };
}
