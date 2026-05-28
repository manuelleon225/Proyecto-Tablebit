const METRICS_KEY = "tbit_media_metrics";
const isDev = import.meta.env.DEV;

interface MediaMetric {
  url: string;
  loadTime: number;
  success: boolean;
  timestamp: number;
}

const metrics: MediaMetric[] = [];

export function trackImageLoad(url: string, loadTime: number, success: boolean): void {
  if (!isDev) return;
  metrics.push({ url, loadTime, success, timestamp: Date.now() });
  if (metrics.length > 50) metrics.shift();
}

export function getMediaMetrics(): MediaMetric[] {
  return [...metrics];
}

export function logMediaMetrics(): void {
  if (!isDev || metrics.length === 0) return;
  const avg = metrics.reduce((a, b) => a + b.loadTime, 0) / metrics.length;
  const failed = metrics.filter((m) => !m.success).length;
  console.log(`[MediaMetrics] ${metrics.length} images | avg ${avg.toFixed(0)}ms | ${failed} failed`);
}
