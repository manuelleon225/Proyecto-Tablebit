import { runDeploymentHealthCheck } from "@/lib/deploymentHealth";
import { isMaintenanceMode } from "@/lib/maintenanceMode";

let active = false;
let deploymentChecks = 0;

export function startOperationsWatchdog(): void {
  if (active) return;
  active = true;
  setInterval(() => {
    const health = runDeploymentHealthCheck();
    if (health.passed) deploymentChecks++;
  }, 60000);
}

export function getOperationsWatchdogMetrics() {
  return { active, deploymentChecks, maintenanceMode: isMaintenanceMode() };
}
