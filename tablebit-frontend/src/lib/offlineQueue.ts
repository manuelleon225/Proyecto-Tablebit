const QUEUE_KEY = "tbit_offline_queue";
const DEAD_LETTER_KEY = "tbit_dead_letter_queue";
const RETRY_DELAYS = [5000, 15000, 30000, 60000];
const MAX_RETRIES = 5;

interface QueuedRequest {
  id: string;
  method: string;
  url: string;
  body?: any;
  timestamp: number;
  retries: number;
  fingerprint?: string;
}

function fingerprint(method: string, url: string, body?: any): string {
  return `${method}:${url}:${body ? JSON.stringify(body) : ""}`;
}

export function enqueueRequest(method: string, url: string, body?: any): void {
  const queue = getQueue();
  const fp = fingerprint(method, url, body);
  if (queue.some((r) => r.fingerprint === fp)) return;
  queue.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    method, url, body, timestamp: Date.now(), retries: 0, fingerprint: fp,
  });
  saveQueue(queue);
}

export function getQueue(): QueuedRequest[] {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]"); } catch { return []; }
}

function saveQueue(queue: QueuedRequest[]): void {
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(queue)); } catch { /* full */ }
}

export function enqueueRequest(method: string, url: string, body?: any): void {
  const queue = getQueue();
  queue.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    method, url, body, timestamp: Date.now(), retries: 0,
  });
  saveQueue(queue);
}

export function dequeueRequest(id: string): void {
  saveQueue(getQueue().filter((r) => r.id !== id));
}

function moveToDeadLetter(req: QueuedRequest): void {
  try {
    const dead = JSON.parse(localStorage.getItem(DEAD_LETTER_KEY) || "[]");
    dead.push({ ...req, failedAt: Date.now() });
    if (dead.length > 50) dead.shift();
    localStorage.setItem(DEAD_LETTER_KEY, JSON.stringify(dead));
  } catch { /* full */ }
}

export function getDeadLetterCount(): number {
  try { return JSON.parse(localStorage.getItem(DEAD_LETTER_KEY) || "[]").length; } catch { return 0; }
}

export async function processQueue(): Promise<{ synced: number; failed: number }> {
  const queue = getQueue();
  let synced = 0;
  let failed = 0;

  for (const req of queue) {
    if (req.retries >= MAX_RETRIES) {
      moveToDeadLetter(req);
      dequeueRequest(req.id);
      failed++;
      continue;
    }
    const delay = RETRY_DELAYS[req.retries];
    if (Date.now() - req.timestamp < delay) continue;

    try {
      const options: RequestInit = {
        method: req.method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("tablebit_token") || ""}` },
      };
      if (req.body) options.body = JSON.stringify(req.body);
      const res = await fetch(req.url, options);
      if (res.ok) {
        dequeueRequest(req.id);
        synced++;
      } else {
        req.retries++;
        saveQueue(getQueue());
        failed++;
      }
    } catch {
      req.retries++;
      saveQueue(getQueue());
      failed++;
    }
  }

  return { synced, failed };
}

export function getQueueMetrics(): { queuedCount: number; failedCount: number; syncSuccessRate: number } {
  const queue = getQueue();
  const total = queue.length;
  const failed = queue.filter((r) => r.retries >= RETRY_DELAYS.length).length;
  return {
    queuedCount: total,
    failedCount: failed,
    syncSuccessRate: total > 0 ? Math.round(((total - failed) / total) * 100) : 100,
  };
}

setInterval(() => {
  if (navigator.onLine) processQueue();
}, 15000);
