import { predictInstability } from "@/lib/runtimeIntelligence";

let active = false;
let unstablePredictions = 0;

export function startIntelligenceWatchdog(): void {
  if (active) return;
  active = true;

  setInterval(() => {
    if (predictInstability()) unstablePredictions++;
  }, 60000);
}

export function getIntelligenceWatchdogMetrics() {
  return { active, unstablePredictions };
}
