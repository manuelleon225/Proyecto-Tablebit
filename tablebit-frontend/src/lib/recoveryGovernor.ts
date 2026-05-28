import { getSystemHealthScore } from "@/lib/systemHealthEngine";

type RecoveryMode = "passive" | "moderate" | "aggressive" | "emergency";

export function getRecoveryMode(): RecoveryMode {
  const score = getSystemHealthScore();
  if (score >= 90) return "passive";
  if (score >= 70) return "moderate";
  if (score >= 40) return "aggressive";
  return "emergency";
}

export function getRecoveryInterval(): number {
  const mode = getRecoveryMode();
  if (mode === "passive") return 60000;
  if (mode === "moderate") return 30000;
  if (mode === "aggressive") return 15000;
  return 5000;
}

export function getRecoveryGovernorMetrics() {
  return { mode: getRecoveryMode(), interval: getRecoveryInterval() };
}
