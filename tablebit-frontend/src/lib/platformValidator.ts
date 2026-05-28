import { getKernelState } from "@/lib/runtimeKernel";
import { getConnectionState } from "@/lib/realtimeClient";
import { getSystemHealthScore } from "@/lib/systemHealthEngine";

export function runPlatformValidation(): { passed: boolean; checks: Record<string, boolean> } {
  const checks: Record<string, boolean> = {
    kernel: getKernelState() === "active",
    realtime: getConnectionState() === "connected",
    health: getSystemHealthScore() >= 70,
  };
  return { passed: Object.values(checks).every(Boolean), checks };
}

export function getValidationReport(): string[] {
  const result = runPlatformValidation();
  return Object.entries(result.checks)
    .filter(([, v]) => !v)
    .map(([k]) => `${k}: failed`);
}
