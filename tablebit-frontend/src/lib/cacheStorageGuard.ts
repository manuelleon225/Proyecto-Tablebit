const STORAGE_WARN_LEVEL = 0.8;
const CACHE_NAMES = ["api-cache", "images-cache", "workbox-precache"];

export async function getStorageUsage(): Promise<{ usage: number; quota: number; percent: number }> {
  if (!navigator.storage?.estimate) return { usage: 0, quota: 0, percent: 0 };
  const est = await navigator.storage.estimate();
  const usage = est.usage || 0;
  const quota = est.quota || 1;
  return { usage, quota, percent: Math.round((usage / quota) * 100) };
}

export async function cleanOldCaches(maxAgeMs = 86400000): Promise<number> {
  const caches = await caches.keys();
  let cleaned = 0;
  for (const name of CACHE_NAMES) {
    const cache = await caches.open(name);
    const requests = await cache.keys();
    for (const req of requests) {
      const resp = await cache.match(req);
      if (resp) {
        const date = resp.headers.get("date");
        if (date) {
          const age = Date.now() - new Date(date).getTime();
          if (age > maxAgeMs) {
            await cache.delete(req);
            cleaned++;
          }
        }
      }
    }
  }
  return cleaned;
}

export async function ensureStorageAvailable(): Promise<boolean> {
  const { percent } = await getStorageUsage();
  if (percent > STORAGE_WARN_LEVEL * 100) {
    await cleanOldCaches();
    const { percent: newPercent } = await getStorageUsage();
    return newPercent <= STORAGE_WARN_LEVEL * 100;
  }
  return true;
}

export async function logStorageStatus(): Promise<void> {
  if (!import.meta.env.DEV) return;
  const { usage, quota, percent } = await getStorageUsage();
  const cleaned = await cleanOldCaches();
  console.log(
    `%c[PWA Storage] usage: ${(usage / 1024 / 1024).toFixed(0)}MB / ${(quota / 1024 / 1024).toFixed(0)}MB (${percent}%) | cleaned: ${cleaned}`,
    `color: ${percent > 80 ? "#ef4444" : percent > 60 ? "#f59e0b" : "#22c55e"}; font-weight: bold`
  );
}

if (import.meta.env.DEV) {
  setInterval(() => logStorageStatus(), 120000);
}
