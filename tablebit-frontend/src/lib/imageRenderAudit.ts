type RenderEventType =
  | "render_start"
  | "placeholder_shown"
  | "lqip_shown"
  | "full_loaded"
  | "render_complete"
  | "render_error"
  | "render_aborted";

interface RenderEvent {
  url: string;
  event: RenderEventType;
  timestamp: number;
  duration?: number;
}

const events: RenderEvent[] = [];
const MAX_EVENTS = 500;
const renderTimestamps = new Map<string, number>();
let flickerCount = 0;

export function trackRenderEvent(url: string, event: RenderEventType, duration?: number): void {
  events.push({ url, event, timestamp: Date.now(), duration });
  if (events.length > MAX_EVENTS) events.shift();

  if (event === "render_start") renderTimestamps.set(url, Date.now());
  if (event === "render_complete") {
    const start = renderTimestamps.get(url);
    if (start && Date.now() - start < 100) flickerCount++;
    renderTimestamps.delete(url);
  }
}

export function detectFlicker(): number {
  return flickerCount;
}

export function getRenderReport() {
  const total = events.filter((e) => e.event === "render_start").length;
  const completed = events.filter((e) => e.event === "render_complete").length;
  const errors = events.filter((e) => e.event === "render_error").length;
  const aborts = events.filter((e) => e.event === "render_aborted").length;

  const renderTimes = events.filter((e) => e.duration !== undefined).map((e) => e.duration!);
  const avgTime = renderTimes.length > 0 ? Math.round(renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length) : 0;

  const urlCount = new Map<string, number>();
  events.forEach((e) => urlCount.set(e.url, (urlCount.get(e.url) || 0) + 1));
  const duplicateUrls = Array.from(urlCount.values()).filter((c) => c > 2).length;

  return {
    totalRenders: total,
    completed,
    errors,
    aborts,
    avgRenderTime: avgTime,
    flickerRisk: flickerCount,
    duplicateUrls,
    stability: total > 0 ? Math.round((completed / total) * 100) : 100,
  };
}

export function logRenderSummary(): void {
  if (!import.meta.env.DEV) return;
  const r = getRenderReport();
  console.log(`%c[RenderAudit] renders: ${r.totalRenders} | avg: ${r.avgRenderTime}ms | flicker: ${r.flickerRisk} | errors: ${r.errors} | stable: ${r.stability}%`, "color:#a855f7;font-weight:bold");
}

if (import.meta.env.DEV) setInterval(() => logRenderSummary(), 60000);
