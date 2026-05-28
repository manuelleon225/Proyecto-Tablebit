let cacheHits = 0;
let cacheMisses = 0;
let offlineSessions = 0;
let installCount = 0;
let syncTimestamps: number[] = [];

export function trackCacheHit(): void { cacheHits++; }
export function trackCacheMiss(): void { cacheMisses++; }
export function trackOfflineSession(): void { offlineSessions++; }
export function trackInstall(): void { installCount++; }
export function trackSyncComplete(ms: number): void {
  syncTimestamps.push(ms);
  if (syncTimestamps.length > 50) syncTimestamps.shift();
}

export function getPWAMetrics() {
  const total = cacheHits + cacheMisses;
  const avgSync = syncTimestamps.length > 0 ? Math.round(syncTimestamps.reduce((a, b) => a + b, 0) / syncTimestamps.length) : 0;
  return {
    cacheHitRate: total > 0 ? Math.round((cacheHits / total) * 100) : 0,
    offlineSessions,
    installCount,
    avgSyncTime: avgSync,
    queueSize: 0,
  };
}

export function logPWAMetrics(): void {
  if (!import.meta.env.DEV) return;
  const m = getPWAMetrics();
  console.log(`%c[PWA] cache: ${m.cacheHitRate}% | offline: ${m.offlineSessions} | sync: ${m.avgSyncTime}ms | installs: ${m.installCount}`, "color:#22c55e;font-weight:bold");
}

if (import.meta.env.DEV) setInterval(() => logPWAMetrics(), 60000);
