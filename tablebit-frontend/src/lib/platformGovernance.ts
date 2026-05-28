import { getKernelState } from "@/lib/runtimeKernel";
import { runPlatformValidation } from "@/lib/platformValidator";

let governanceActive = false;

export function startGovernance(): void {
  governanceActive = true;
}

export function stopGovernance(): void {
  governanceActive = false;
}

export function getGovernanceMetrics() {
  return {
    active: governanceActive,
    kernelState: getKernelState(),
    validation: runPlatformValidation().passed,
  };
}
