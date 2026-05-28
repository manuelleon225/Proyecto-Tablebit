import { runPlatformValidation } from "@/lib/platformValidator";

let certified = false;
let lastCertification: string | null = null;

export function runProductionCertification(): { passed: boolean; score: number } {
  const validation = runPlatformValidation();
  const score = Object.values(validation.checks).filter(Boolean).length / Object.values(validation.checks).length * 100;

  certified = validation.passed;
  lastCertification = new Date().toISOString();

  return { passed: validation.passed, score: Math.round(score) };
}

export function getCertificationStatus() {
  return { certified, lastCertification };
}
