const LOCKS_PREFIX = "tbit_lock_";
const DEFAULT_TTL = 30000;

export function acquireLock(name: string, ttl = DEFAULT_TTL): boolean {
  const key = LOCKS_PREFIX + name;
  const now = Date.now();
  const existing = localStorage.getItem(key);
  if (existing) {
    const parsed = JSON.parse(existing);
    if (now - parsed.timestamp < ttl) return false;
    forceReleaseStaleLock(name);
  }
  localStorage.setItem(key, JSON.stringify({ owner: "tab", timestamp: now }));
  return true;
}

export function releaseLock(name: string): void {
  localStorage.removeItem(LOCKS_PREFIX + name);
}

export function isLocked(name: string): boolean {
  const existing = localStorage.getItem(LOCKS_PREFIX + name);
  if (!existing) return false;
  const parsed = JSON.parse(existing);
  return Date.now() - parsed.timestamp < DEFAULT_TTL;
}

function forceReleaseStaleLock(name: string): void {
  localStorage.removeItem(LOCKS_PREFIX + name);
}

export function forceReleaseStaleLocks(): number {
  let released = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(LOCKS_PREFIX)) {
      const val = localStorage.getItem(key);
      if (val) {
        const parsed = JSON.parse(val);
        if (Date.now() - parsed.timestamp > DEFAULT_TTL) {
          localStorage.removeItem(key);
          released++;
        }
      }
    }
  }
  return released;
}
