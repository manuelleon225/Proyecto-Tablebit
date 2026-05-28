import { runPredictiveStabilization } from "@/lib/predictiveStabilizer";
import { getSystemHealthScore } from "@/lib/systemHealthEngine";

let preventiveActions = 0;

export function prepareRecovery(): string[] {
  return runPredictiveStabilization();
}

export function executePreventiveRecovery(): boolean {
  const health = getSystemHealthScore();
  if (health < 50) {
    preventiveActions++;
    return true;
  }
  return false;
}

export function getPredictiveRecoveryMetrics() {
  return { totalPreventiveActions: preventiveActions };
}
