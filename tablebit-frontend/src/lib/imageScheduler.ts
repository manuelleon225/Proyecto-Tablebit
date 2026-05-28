import type { ImagePriority } from "@/lib/imagePriority";
import { comparePriority } from "@/lib/imagePriority";
import { getOrCreateImage, isInCache, markPermanentFailure } from "@/lib/imageRequestCache";
import { getConnectionType, isSaveDataEnabled } from "@/lib/imagePlaceholder";

const MAX_QUEUE_AGE_MS = 60000;
const LOW_CPU_CORES = 4;
const LOW_MEMORY_GB = 2;

interface ImageTask {
  url: string;
  priority: ImagePriority;
  resolve: () => void;
  reject: () => void;
  createdAt: number;
  controller: AbortController;
}

class ImageScheduler {
  private queue: ImageTask[] = [];
  private running = 0;
  private maxConcurrent = 4;
  private totalProcessed = 0;
  private totalWaitTime = 0;
  private priorityCounts: Record<string, number> = {};
  private abortRegistry = new Map<string, AbortController>();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;
  private recentRenderTimes: number[] = [];
  private readonly MAX_RENDER_SAMPLE = 20;

  constructor() {
    this.updateConcurrencyByNetwork();
    if (typeof window !== "undefined") {
      const conn = (navigator as any).connection;
      if (conn) conn.addEventListener("change", () => this.updateConcurrencyByNetwork());
    }
    this.updateDeviceCapabilities();
    this.cleanupInterval = setInterval(() => this.cleanupStaleJobs(), 30000);
  }

  private updateDeviceCapabilities(): void {
    if (typeof navigator === "undefined") return;
    if (navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= LOW_CPU_CORES) {
      this.maxConcurrent = Math.min(this.maxConcurrent, 2);
    }
    if ((navigator as any).deviceMemory !== undefined && (navigator as any).deviceMemory <= LOW_MEMORY_GB) {
      this.maxConcurrent = Math.min(this.maxConcurrent, 1);
    }
  }

  private updateConcurrencyByNetwork(): void {
    if (isSaveDataEnabled()) { this.maxConcurrent = 1; return; }
    const conn = getConnectionType();
    if (conn === "slow-2g" || conn === "2g") { this.maxConcurrent = 2; return; }
    if (conn === "3g") { this.maxConcurrent = 3; return; }
    this.maxConcurrent = 4;
  }

  enqueue(url: string, priority: ImagePriority): Promise<void> {
    if (isInCache(url)) return Promise.resolve();

    const existing = this.abortRegistry.get(url);
    if (existing) return new Promise((resolve) => {
      this.queue.push({ url, priority, resolve, reject: resolve, createdAt: Date.now(), controller: existing });
      this.compactQueue();
      this.processQueue();
    });

    return new Promise((resolve, reject) => {
      const controller = new AbortController();
      this.abortRegistry.set(url, controller);
      this.queue.push({ url, priority, resolve, reject, createdAt: Date.now(), controller });
      this.priorityCounts[priority] = (this.priorityCounts[priority] || 0) + 1;
      this.compactQueue();
      this.applyBackpressure();
      this.processQueue();
    });
  }

  private compactQueue(): void {
    const seen = new Map<string, ImageTask>();
    this.queue.forEach((task) => {
      const existing = seen.get(task.url);
      if (!existing || comparePriority(task.priority, existing.priority) < 0) {
        if (existing && existing !== task) existing.reject(new Error("Deduplicated"));
        seen.set(task.url, task);
      } else {
        task.reject(new Error("Deduplicated"));
      }
    });
    this.queue = Array.from(seen.values()).sort((a, b) => comparePriority(a.priority, b.priority));
  }

  private applyBackpressure(): void {
    if (this.queue.length > 20) this.maxConcurrent = Math.max(1, this.maxConcurrent - 1);
    else if (this.queue.length < 5) this.maxConcurrent = Math.min(4, this.maxConcurrent + 1);
  }

  abortImage(url: string): void {
    const ctrl = this.abortRegistry.get(url);
    if (ctrl) { ctrl.abort(); this.abortRegistry.delete(url); }
    this.queue = this.queue.filter((t) => t.url !== url);
  }

  abortAll(): void {
    this.abortRegistry.forEach((c) => c.abort());
    this.abortRegistry.clear();
    this.queue = [];
    this.running = 0;
  }

  private cleanupStaleJobs(): void {
    const cutoff = Date.now() - MAX_QUEUE_AGE_MS;
    const stale = this.queue.filter((t) => t.createdAt < cutoff);
    stale.forEach((t) => {
      t.controller.abort();
      this.abortRegistry.delete(t.url);
      t.reject(new Error("Stale job cancelled"));
    });
    this.queue = this.queue.filter((t) => t.createdAt >= cutoff);
  }

  private processQueue(): void {
    let batchCount = 0;
    const maxBatch = this.recentRenderTimes.length >= 5 && this.recentRenderTimes.reduce((a, b) => a + b, 0) / this.recentRenderTimes.length > 400 ? 2 : this.maxConcurrent;
    while (this.running < this.maxConcurrent && this.queue.length > 0 && batchCount < maxBatch) {
      const task = this.queue.shift()!;

      if (task.controller.signal.aborted) { task.resolve(); continue; }
      if (isInCache(task.url)) { task.resolve(); continue; }
      if (Date.now() - task.createdAt > MAX_QUEUE_AGE_MS) { task.resolve(); continue; }

      this.running++;
      const start = performance.now();

      getOrCreateImage(task.url)
        .then(() => {
          this.running--;
          this.totalProcessed++;
          const elapsed = performance.now() - start;
          this.totalWaitTime += elapsed;
          this.recordRenderTime(elapsed);
          this.abortRegistry.delete(task.url);
          task.resolve();
          this.processQueue();
        })
        .catch(() => {
          this.running--;
          this.abortRegistry.delete(task.url);
          markPermanentFailure(task.url);
          task.reject();
          this.processQueue();
        });
    }
  }

  private recordRenderTime(ms: number): void {
    this.recentRenderTimes.push(ms);
    if (this.recentRenderTimes.length > this.MAX_RENDER_SAMPLE) this.recentRenderTimes.shift();
    if (this.recentRenderTimes.length >= 5) {
      const avg = this.recentRenderTimes.reduce((a, b) => a + b, 0) / this.recentRenderTimes.length;
      if (avg > 400) this.maxConcurrent = Math.max(1, this.maxConcurrent - 1);
      else if (avg < 150) this.maxConcurrent = Math.min(4, this.maxConcurrent + 1);
    }
  }

  flushIdleQueue(): void {
    if (typeof requestIdleCallback === "undefined") return;
    requestIdleCallback(() => {
      while (this.queue.length > 0 && this.running < this.maxConcurrent) {
        const task = this.queue.shift()!;
        if (isInCache(task.url)) { task.resolve(); continue; }
      this.running++;
      batchCount++;
        getOrCreateImage(task.url).then(() => {
          this.running--; task.resolve(); this.processQueue();
        }).catch(() => {
          this.running--; task.reject(); this.processQueue();
        });
      }
    }, { timeout: 3000 });
  }

  getMetrics(): Record<string, number | string> {
    return {
      queueSize: this.queue.length,
      running: this.running,
      maxConcurrent: this.maxConcurrent,
      totalProcessed: this.totalProcessed,
      avgWaitMs: this.totalProcessed > 0 ? Math.round(this.totalWaitTime / this.totalProcessed) : 0,
      ...this.priorityCounts,
    };
  }

  logMetrics(): void {
    if (!import.meta.env.DEV) return;
    const m = this.getMetrics();
    console.log(`%c[ImageScheduler] queue: ${m.queueSize} | running: ${m.running}/${m.maxConcurrent} | processed: ${m.totalProcessed} | avg: ${m.avgWaitMs}ms`, "color:#38bdf8;font-weight:bold");
  }
}

export const imageScheduler = new ImageScheduler();

if (import.meta.env.DEV) {
  setInterval(() => imageScheduler.logMetrics(), 60000);
}
