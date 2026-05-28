import { runProductionCertification } from "@/lib/productionCertification";
import { getSystemHealthScore } from "@/lib/systemHealthEngine";

let deploymentHealthy = false;

export function getCurrentBuild(): string {
  return import.meta.env.VITE_BUILD_VERSION || "dev";
}

export function getBuildMetadata() {
  return { version: getCurrentBuild(), buildTime: new Date().toISOString(), environment: import.meta.env.MODE };
}

export function validateDeploymentReadiness(): { ready: boolean; score: number; checks: string[] } {
  const checks: string[] = [];
  const cert = runProductionCertification();
  const health = getSystemHealthScore();

  if (cert.passed) checks.push("certification: passed");
  else checks.push("certification: failed");

  if (health >= 70) checks.push("health: ok");
  else checks.push("health: low");

  return { ready: checks.every((c) => !c.includes("failed") && !c.includes("low")), score: health, checks };
}

export function markDeploymentHealthy(): void { deploymentHealthy = true; }
export function rollbackDeployment(): void { deploymentHealthy = false; }
export function getDeploymentMetrics() { return { healthy: deploymentHealthy, build: getCurrentBuild() }; }
