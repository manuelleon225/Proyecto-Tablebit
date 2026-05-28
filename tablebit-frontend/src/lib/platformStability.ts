import { getSystemHealthScore } from "@/lib/systemHealthEngine";
import { runPlatformValidation } from "@/lib/platformValidator";

export function calculatePlatformStability(): number {
  const health = getSystemHealthScore();
  const validation = runPlatformValidation();
  const validationScore = Object.values(validation.checks).filter(Boolean).length / Object.values(validation.checks).length * 100;
  return Math.round((health + validationScore) / 2);
}

export function getStabilityForecast(): string {
  const score = calculatePlatformStability();
  if (score >= 90) return "excellent";
  if (score >= 70) return "good";
  if (score >= 40) return "fair";
  return "poor";
}
