const MAX_CACHE = 75;
const pendingRequests = new Map<string, Promise<HTMLImageElement>>();
const resolvedCache = new Map<string, { img: HTMLImageElement; ttl: number }>();
const failedCache = new Map<string, number>();
const accessOrder: string[] = [];
const RETRY_LIMIT = 2;
const RETRY_BACKOFF = [300, 800, 2000];
const FAILURE_TTL = 60000;
const TTL: Record<string, number> = { HERO: 600000, VISIBLE: 300000, BELOW_FOLD: 120000 };

let cacheHits = 0;
let cacheMisses = 0;
let duplicatesBlocked = 0;
let retryCount = 0;

function getTtlForUrl(url: string): number {
  if (url.includes("hero") || url.includes("banner")) return TTL.HERO;
  if (url.includes("thumb") || url.includes("logo")) return TTL.VISIBLE;
  return TTL.BELOW_FOLD;
}

function touch(url: string): void {
  const idx = accessOrder.indexOf(url);
  if (idx > -1) accessOrder.splice(idx, 1);
  accessOrder.push(url);
  if (accessOrder.length > MAX_CACHE) {
    const removeCount = Math.max(1, Math.floor(MAX_CACHE * 0.2));
    for (let i = 0; i < removeCount; i++) {
      const oldest = accessOrder.shift();
      if (oldest) { resolvedCache.delete(oldest); pendingRequests.delete(oldest); failedCache.delete(oldest); }
    }
  }
}

function enforceMemoryGuard(): void {
  if (resolvedCache.size + pendingRequests.size + failedCache.size > MAX_CACHE + 10) {
    touch("__force_cleanup");
  }
}

async function fetchWithRetry(url: string, attempt = 0): Promise<HTMLImageElement> {
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed: ${url}`));
      img.src = url;
    });
  } catch (err) {
    if (attempt < RETRY_LIMIT) {
      retryCount++;
      await new Promise((r) => setTimeout(r, RETRY_BACKOFF[attempt] || 2000));
      return fetchWithRetry(url, attempt + 1);
    }
    throw err;
  }
}

export function getOrCreateImage(url: string, priority?: string): Promise<HTMLImageElement> {
  enforceMemoryGuard();

  const cached = resolvedCache.get(url);
  if (cached) {
    if (Date.now() >= cached.ttl) { resolvedCache.delete(url); }
    else { cacheHits++; touch(url); return Promise.resolve(cached.img); }
  }

  const failed = failedCache.get(url);
  if (failed && Date.now() < failed) { throw new Error(`Permanently failed: ${url}`); }

  const pending = pendingRequests.get(url);
  if (pending) { duplicatesBlocked++; return pending; }

  cacheMisses++;
  const ttl = getTtlForUrl(url);
  const promise = fetchWithRetry(url)
    .then((img) => {
      resolvedCache.set(url, { img, ttl: Date.now() + ttl });
      pendingRequests.delete(url);
      touch(url);
      return img;
    })
    .catch((err) => {
      pendingRequests.delete(url);
      markPermanentFailure(url);
      throw err;
    });

  pendingRequests.set(url, promise);
  return promise;
}

export function markPermanentFailure(url: string): void {
  failedCache.set(url, Date.now() + FAILURE_TTL);
  if (failedCache.size > MAX_CACHE) {
    const first = failedCache.keys().next().value;
    if (first) failedCache.delete(first);
  }
}

export function isInCache(url: string): boolean {
  const cached = resolvedCache.get(url);
  if (cached && Date.now() < cached.ttl) return true;
  if (cached) resolvedCache.delete(url);
  return pendingRequests.has(url);
}

export function removeFromCache(url: string): void {
  resolvedCache.delete(url); pendingRequests.delete(url); failedCache.delete(url);
  const idx = accessOrder.indexOf(url);
  if (idx > -1) accessOrder.splice(idx, 1);
}

export function clearImageCache(): void {
  resolvedCache.clear(); pendingRequests.clear(); failedCache.clear(); accessOrder.length = 0;
}

export function getCacheMetrics() {
  const total = cacheHits + cacheMisses;
  return {
    hits: cacheHits, misses: cacheMisses, duplicatesBlocked, retryCount,
    efficiency: total > 0 ? Math.round((cacheHits / total) * 100) : 0,
    size: resolvedCache.size, failed: failedCache.size,
  };
}

export function logCacheMetrics(): void {
  if (!import.meta.env.DEV) return;
  const m = getCacheMetrics();
  console.log(`%c[ImageCache] hits: ${m.hits} | misses: ${m.misses} | dup: ${m.duplicatesBlocked} | retries: ${m.retryCount} | eff: ${m.efficiency}% | size: ${m.size} | failed: ${m.failed}`, "color:#22c55e;font-weight:bold");
}

if (import.meta.env.DEV) setInterval(() => logCacheMetrics(), 30000);
