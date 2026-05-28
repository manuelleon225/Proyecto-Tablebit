import { runPlatformValidation } from "@/lib/platformValidator";
import { calculatePlatformStability } from "@/lib/platformStability";

let active = false;
let integrityFailures = 0;

export function startPlatformWatchdog(): void {
  if (active) return;
  active = true;

  setInterval(() => {
    const validation = runPlatformValidation();
    if (!validation.passed) integrityFailures++;
  }, 60000);
}

export function getPlatformWatchdogMetrics() {
  return {
    active,
    integrityFailures,
    stability: calculatePlatformStability(),
  };
}
