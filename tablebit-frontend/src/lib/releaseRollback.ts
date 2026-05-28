const STORAGE_KEY = "tbit_rollback_points";
const MAX_POINTS = 5;

interface RollbackPoint { version: string; channel: string; timestamp: number; }

export function createRollbackPoint(): void {
  const points = getRollbackPoints();
  points.push({ version: "2.0.0", channel: "stable", timestamp: Date.now() });
  if (points.length > MAX_POINTS) points.shift();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(points));
}

export function getRollbackPoints(): RollbackPoint[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

export function clearRollbackPoints(): void {
  localStorage.removeItem(STORAGE_KEY);
}
