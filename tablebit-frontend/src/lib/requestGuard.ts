const requestHistory = new Map<string, number[]>();
const THROTTLE_MS = 1000;
const MAX_REPLAY = 5;

export function guardRequest(key: string): boolean {
  const now = Date.now();
  const history = requestHistory.get(key) || [];
  const recent = history.filter((t) => now - t < THROTTLE_MS);
  recent.push(now);
  requestHistory.set(key, recent);
  return recent.length <= MAX_REPLAY;
}

export function detectReplay(key: string): boolean {
  return !guardRequest(key);
}

export function clearRequestHistory(): void {
  requestHistory.clear();
}
