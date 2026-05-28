const VALID_EVENT_TYPES = [
  "reserva.created", "reserva.updated", "reserva.cancelled",
  "restaurante.updated", "image.uploaded", "image.deleted",
  "alert.created", "alert.resolved",
];

let invalidEventCount = 0;

export function validateEvent(event: any): boolean {
  if (!event || typeof event !== "object") { invalidEventCount++; return false; }
  if (!event.type || typeof event.type !== "string") { invalidEventCount++; return false; }
  if (!VALID_EVENT_TYPES.includes(event.type) && !event.type.startsWith("_")) { invalidEventCount++; return false; }
  if (event.timestamp && isNaN(Date.parse(event.timestamp))) { invalidEventCount++; return false; }
  return true;
}

export function sanitizeEvent(event: any): any {
  return {
    type: event.type,
    payload: event.payload || {},
    timestamp: event.timestamp || new Date().toISOString(),
  };
}

export function getInvalidEventCount(): number { return invalidEventCount; }
