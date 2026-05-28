type EventHandler = (payload: any) => void;

const handlers = new Map<string, Set<EventHandler>>();
const processedEvents = new Set<string>();

const MAX_PROCESSED = 200;

export function on(event: string, handler: EventHandler): () => void {
  if (!handlers.has(event)) handlers.set(event, new Set());
  handlers.get(event)!.add(handler);
  return () => handlers.get(event)?.delete(handler);
}

export function off(event: string, handler: EventHandler): void {
  handlers.get(event)?.delete(handler);
}

export function emit(event: string, payload: any): void {
  const eventId = `${event}:${payload?.timestamp || Date.now()}`;
  if (processedEvents.has(eventId)) return;
  processedEvents.add(eventId);
  if (processedEvents.size > MAX_PROCESSED) {
    const first = processedEvents.values().next().value;
    if (first) processedEvents.delete(first);
  }
  handlers.get(event)?.forEach((h) => h(payload));
  handlers.get("*")?.forEach((h) => h({ type: event, payload }));
}
