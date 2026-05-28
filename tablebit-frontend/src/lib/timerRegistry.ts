const timers = new Map<string, { type: string; id: any; createdAt: number }>();
let counter = 0;

export function registerTimer(type: string, id: any): string {
  const key = `timer_${++counter}`;
  timers.set(key, { type, id, createdAt: Date.now() });
  return key;
}

export function clearRegisteredTimer(key: string): void {
  const t = timers.get(key);
  if (!t) return;
  if (t.type === "timeout") clearTimeout(t.id);
  else if (t.type === "interval") clearInterval(t.id);
  timers.delete(key);
}

export function clearAllTimers(): void {
  timers.forEach((t) => {
    if (t.type === "timeout") clearTimeout(t.id);
    else if (t.type === "interval") clearInterval(t.id);
  });
  timers.clear();
}

export function getTimerMetrics(): { total: number; byType: Record<string, number>; stale: number } {
  const byType: Record<string, number> = {};
  let stale = 0;
  timers.forEach((t) => {
    byType[t.type] = (byType[t.type] || 0) + 1;
    if (Date.now() - t.createdAt > 3600000) stale++;
  });
  return { total: timers.size, byType, stale };
}
