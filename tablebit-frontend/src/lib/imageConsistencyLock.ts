import { getImageState, setImageState, clearAllImageStates } from "@/lib/imageStateStore";
import { isInCache, getCacheMetrics } from "@/lib/imageRequestCache";
import { imageScheduler } from "@/lib/imageScheduler";

type ConsistencyStatus = "OK" | "CACHE_MISMATCH" | "RENDER_STATE_CONFLICT";

export function validateImageConsistency(url: string): ConsistencyStatus {
  const cacheReady = isInCache(url);
  const state = getImageState(url);
  if (!cacheReady && state === "ready") return "CACHE_MISMATCH";
  if (cacheReady && state === undefined) return "RENDER_STATE_CONFLICT";
  if (state === "error" && cacheReady) return "CACHE_MISMATCH";
  return "OK";
}

export function repairConsistencyIfNeeded(url: string): void {
  const status = validateImageConsistency(url);
  if (status === "RENDER_STATE_CONFLICT" && isInCache(url)) {
    setImageState(url, "ready");
  }
}

export function globalConsistencyCheck(): { issues: string[]; fixed: number } {
  const issues: string[] = [];
  let fixed = 0;
  const metrics = getCacheMetrics();

  const sched = imageScheduler.getMetrics();
  if (typeof sched.queueSize === "number" && sched.queueSize > 0 && metrics.size === 0) {
    issues.push("scheduler has jobs but cache is empty");
    imageScheduler.abortAll();
    fixed++;
  }

  if (typeof sched.running === "number" && sched.running > 0 && metrics.size === 0) {
    issues.push("scheduler running but cache empty — possible leak");
    fixed++;
  }

  return { issues, fixed };
}

export function logConsistencyStatus(): void {
  if (!import.meta.env.DEV) return;
  const result = globalConsistencyCheck();
  if (result.issues.length > 0) {
    console.warn(`[Consistency] ${result.issues.length} issues found, ${result.fixed} fixed`);
  } else {
    console.log(`%c[Consistency] OK`, "color: #22c55e; font-weight: bold");
  }
}

if (import.meta.env.DEV) setInterval(() => logConsistencyStatus(), 60000);

export { clearAllImageStates };
