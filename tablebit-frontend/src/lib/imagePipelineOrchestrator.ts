import { isInCache, getOrCreateImage, clearImageCache } from "@/lib/imageRequestCache";
import { setImageState, clearAllImageStates } from "@/lib/imageStateStore";
import { trackRenderEvent } from "@/lib/imageRenderAudit";
import { validateImageConsistency, repairConsistencyIfNeeded } from "@/lib/imageConsistencyLock";
import { imageScheduler } from "@/lib/imageScheduler";
import type { ImagePriority } from "@/lib/imagePriority";

const activeFlows = new Map<string, Promise<void>>();

export async function executeImageFlow(url: string, priority: ImagePriority = "VISIBLE"): Promise<void> {
  const existing = activeFlows.get(url);
  if (existing) return existing;

  const promise = executeInternal(url, priority);
  activeFlows.set(url, promise);
  try { await promise; } finally { activeFlows.delete(url); }
}

async function executeInternal(url: string, priority: ImagePriority): Promise<void> {
  repairConsistencyIfNeeded(url);

  if (validateImageConsistency(url) === "CACHE_MISMATCH") {
    clearImageCache();
  }

  if (isInCache(url)) {
    setImageState(url, "ready");
    return;
  }

  setImageState(url, "loading");
  trackRenderEvent(url, "render_start");

  try {
    await imageScheduler.enqueue(url, priority);
    await getOrCreateImage(url);
    setImageState(url, "ready");
    trackRenderEvent(url, "render_complete");
  } catch {
    setImageState(url, "error");
    trackRenderEvent(url, "render_error");
    throw new Error(`Image flow failed: ${url}`);
  }
}

export function isFlowActive(url: string): boolean {
  return activeFlows.has(url);
}

export function abortFlow(url: string): void {
  imageScheduler.abortImage(url);
  activeFlows.delete(url);
}
