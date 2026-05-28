import { getHealingMetrics } from "@/lib/selfHealingEngine";
import { getFailoverMode } from "@/lib/failoverOrchestrator";

let active = false;
let healingLoopsDetected = 0;

export function startHealingWatchdog(): void {
  if (active) return;
  active = true;

  setInterval(() => {
    const h = getHealingMetrics();
    const mode = getFailoverMode();

    if (h.totalHealings > 10 && mode !== "emergency") {
      healingLoopsDetected++;
    }
  }, 60000);
}

export function getHealingWatchdogMetrics() {
  return { active, healingLoopsDetected };
}
