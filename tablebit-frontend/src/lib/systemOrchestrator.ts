import { getSystemHealthScore, getHealthLevel } from "@/lib/systemHealthEngine";
import { emergencyRecovery, getRecoveryMetrics } from "@/lib/systemRecovery";
import { getLifecycleState } from "@/lib/systemLifecycle";
import { isSystemFrozen, getFreezeState } from "@/lib/systemFreeze";
import { isSystemDegraded, getDegradeReason } from "@/lib/systemDegradation";

export function runGlobalHealthCheck() {
  const score = getSystemHealthScore();
  return {
    healthy: score >= 90,
    score,
    level: getHealthLevel(score),
    lifecycle: getLifecycleState(),
    frozen: isSystemFrozen(),
    degraded: isSystemDegraded(),
    degradeReason: getDegradeReason(),
    freezeState: getFreezeState(),
    recovery: getRecoveryMetrics(),
  };
}

export function recoverAll(): void {
  emergencyRecovery();
}
