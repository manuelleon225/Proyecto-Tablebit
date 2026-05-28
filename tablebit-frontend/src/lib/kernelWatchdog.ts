import { getKernelState } from "@/lib/runtimeKernel";
import { getSchedulerMetrics } from "@/lib/globalTaskScheduler";

let active = false;
let deadlocksDetected = 0;
let starvationEvents = 0;

export function startKernelWatchdog(): void {
  if (active) return;
  active = true;

  setInterval(() => {
    const kernel = getKernelState();
    if (kernel === "frozen" || kernel === "shutdown") deadlocksDetected++;

    const sched = getSchedulerMetrics();
    if (sched.total > 20) starvationEvents++;
  }, 60000);
}

export function getKernelWatchdogMetrics() {
  return { active, deadlocksDetected, starvationEvents };
}
