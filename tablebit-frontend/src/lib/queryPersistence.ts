const CACHE_PREFIX = "tbit_q_";
const CACHE_EXPIRY = 30 * 60 * 1000;
const MAX_KEYS = 20;

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

function getKey(hash: string): string {
  return CACHE_PREFIX + hash;
}

function hashKey(key: unknown[]): string {
  return key.map((k) => String(k)).join("|");
}

export function getPersistedQuery<T>(key: unknown[]): T | undefined {
  try {
    const raw = localStorage.getItem(getKey(hashKey(key)));
    if (!raw) return;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(getKey(hashKey(key)));
      return;
    }
    return entry.data as T;
  } catch {
    return;
  }
}

export function setPersistedQuery(key: unknown[], data: unknown): void {
  try {
    if (localStorage.length >= MAX_KEYS + 10) {
      const keys: { key: string; time: number }[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith(CACHE_PREFIX)) {
          try {
            const entry: CacheEntry = JSON.parse(localStorage.getItem(k)!);
            keys.push({ key: k, time: entry.timestamp });
          } catch { /* skip */ }
        }
      }
      keys.sort((a, b) => a.time - b.time);
      keys.slice(0, keys.length - MAX_KEYS).forEach((k) => localStorage.removeItem(k.key));
    }
    const entry: CacheEntry = { data, timestamp: Date.now() };
    localStorage.setItem(getKey(hashKey(key)), JSON.stringify(entry));
  } catch { /* storage full */ }
}

export function clearPersistedCache(): void {
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith(CACHE_PREFIX)) toRemove.push(k);
  }
  toRemove.forEach((k) => localStorage.removeItem(k));
}

export const PERSISTED_QUERIES = [
  "mis-restaurantes",
  "dashboard-analytics",
  "reservas-admin",
  "mesas",
  "calendario",
];
