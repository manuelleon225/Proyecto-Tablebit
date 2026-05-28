import { runSelfHealing, isSystemRecoverable, getHealingMetrics } from "@/lib/selfHealingEngine";
import { getFailoverMode, activateFailover, restoreNormalOperation } from "@/lib/failoverOrchestrator";
import { getConsistencyMetrics } from "@/lib/consistencyWatchdog";

export async function runRecoveryPipeline(): Promise<{ recovered: boolean; steps: number }> {
  let steps = 0;

  if (getFailoverMode() === "emergency") return { recovered: false, steps };

  const healing = runSelfHealing();
  steps += healing.repairs;

  if (isSystemRecoverable()) {
    restoreNormalOperation();
    steps++;
  }

  return { recovered: true, steps };
}

export async function validateRecovery(): Promise<boolean> {
  const h = getHealingMetrics();
  const c = getConsistencyMetrics();
  return h.recoverable && c.active;
}
