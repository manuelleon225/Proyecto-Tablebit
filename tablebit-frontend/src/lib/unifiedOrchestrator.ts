import { bootKernel, getKernelState, setKernelState } from "@/lib/runtimeKernel";
import { runSelfHealing } from "@/lib/selfHealingEngine";
import { getSystemHealthScore } from "@/lib/systemHealthEngine";

let cycleCount = 0;

export function runUnifiedCycle(): { cycle: number; health: number } {
  cycleCount++;
  const health = getSystemHealthScore();

  if (health < 40) setKernelState("degraded");
  else if (getKernelState() === "degraded" && health >= 70) setKernelState("active");

  if (health < 40) runSelfHealing();

  return { cycle: cycleCount, health };
}

export function synchronizeSubsystems(): boolean {
  return getKernelState() === "active";
}

export function validateGlobalHealth(): boolean {
  return getSystemHealthScore() >= 70;
}
