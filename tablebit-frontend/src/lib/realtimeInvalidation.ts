import type { QueryClient } from "@tanstack/react-query";

const INVALIDATION_MAP: Record<string, string[][]> = {
  "reserva.created": [["reservas"], ["dashboard"]],
  "reserva.updated": [["reservas"]],
  "reserva.cancelled": [["reservas"], ["dashboard"]],
  "restaurante.updated": [["restaurante", "mis-restaurantes"]],
  "image.uploaded": [["imagenes"]],
  "image.deleted": [["imagenes"]],
  "alert.created": [["admin-alerts", "admin-analytics"]],
};

let debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

export function invalidateRealtimeEvent(queryClient: QueryClient, eventType: string): void {
  const keys = INVALIDATION_MAP[eventType];
  if (!keys) return;

  keys.forEach((key) => {
    const keyStr = key.join(":");
    if (debounceTimers.has(keyStr)) clearTimeout(debounceTimers.get(keyStr));
    debounceTimers.set(keyStr, setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: key });
      debounceTimers.delete(keyStr);
    }, 250));
  });
}

export function registerInvalidation(eventType: string, queryKeys: string[][]): void {
  INVALIDATION_MAP[eventType] = queryKeys;
}
