const QUEUE_KEY = "tbit_action_queue";

interface QueuedAction {
  id: string;
  type: string;
  payload: unknown;
  timestamp: number;
}

function getQueue(): QueuedAction[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: QueuedAction[]): void {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch { /* storage full */ }
}

export function enqueueAction(type: string, payload: unknown): void {
  const queue = getQueue();
  queue.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    type,
    payload,
    timestamp: Date.now(),
  });
  saveQueue(queue);
}

export function getPendingActions(): QueuedAction[] {
  return getQueue();
}

export function dequeueAction(id: string): void {
  const queue = getQueue().filter((a) => a.id !== id);
  saveQueue(queue);
}

export function clearQueue(): void {
  localStorage.removeItem(QUEUE_KEY);
}
