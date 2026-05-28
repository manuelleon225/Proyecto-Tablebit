interface ListenerEntry {
  target: string;
  event: string;
  handler: EventListener;
  createdAt: number;
}

const listeners: ListenerEntry[] = [];

export function registerListener(target: string, event: string, handler: EventListener): () => void {
  const entry: ListenerEntry = { target, event, handler, createdAt: Date.now() };
  listeners.push(entry);
  return () => {
    const idx = listeners.indexOf(entry);
    if (idx > -1) listeners.splice(idx, 1);
  };
}

export function cleanupAllListeners(): void {
  listeners.length = 0;
}

export function getListenerMetrics(): { total: number; byTarget: Record<string, number>; stale: number } {
  const byTarget: Record<string, number> = {};
  let stale = 0;
  listeners.forEach((l) => {
    byTarget[l.target] = (byTarget[l.target] || 0) + 1;
    if (Date.now() - l.createdAt > 3600000) stale++;
  });
  return { total: listeners.length, byTarget, stale };
}
