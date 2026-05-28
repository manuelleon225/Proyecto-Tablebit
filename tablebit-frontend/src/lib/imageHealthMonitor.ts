interface HealthEntry {
  url: string;
  status: "success" | "failure" | "retry" | "abort";
  loadTime: number;
  timestamp: number;
}

const healthLog: HealthEntry[] = [];
const MAX_LOG = 200;

export function trackImageHealth(
  url: string,
  status: HealthEntry["status"],
  loadTime: number
): void {
  healthLog.push({ url, status, loadTime, timestamp: Date.now() });
  if (healthLog.length > MAX_LOG) healthLog.shift();
}

export function getHealthReport() {
  const total = healthLog.length;
  if (total === 0) return { total: 0, successRate: 0, retryRate: 0, abortRate: 0, avgLoadTime: 0 };

  const success = healthLog.filter((e) => e.status === "success").length;
  const retries = healthLog.filter((e) => e.status === "retry").length;
  const aborts = healthLog.filter((e) => e.status === "abort").length;
  const avgLoad = healthLog.filter((e) => e.status === "success").reduce((a, b) => a + b.loadTime, 0) / (success || 1);

  return {
    total,
    successRate: Math.round((success / total) * 100),
    retryRate: Math.round((retries / total) * 100),
    abortRate: Math.round((aborts / total) * 100),
    avgLoadTime: Math.round(avgLoad),
  };
}

export function logHealthSummary(): void {
  if (!import.meta.env.DEV) return;
  const r = getHealthReport();
  console.log(`%c[ImageHealth] ${r.total} loads | success: ${r.successRate}% | retry: ${r.retryRate}% | abort: ${r.abortRate}% | avg ${r.avgLoadTime}ms`, "color:#f59e0b;font-weight:bold");
}

if (import.meta.env.DEV) setInterval(() => logHealthSummary(), 60000);
