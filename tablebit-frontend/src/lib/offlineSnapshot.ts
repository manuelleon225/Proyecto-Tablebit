const SNAPSHOT_KEY = "tbit_offline_snapshot";

interface SnapshotData {
  data: any;
  timestamp: number;
  type: string;
}

export function saveSnapshot(type: string, data: any): void {
  try {
    const snapshots = getSnapshots();
    snapshots[type] = { data, timestamp: Date.now(), type };
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshots));
  } catch { /* storage full */ }
}

export function getSnapshot(type: string): SnapshotData | null {
  const snapshots = getSnapshots();
  return snapshots[type] || null;
}

function getSnapshots(): Record<string, SnapshotData> {
  try {
    return JSON.parse(localStorage.getItem(SNAPSHOT_KEY) || "{}");
  } catch { return {}; }
}

export function clearSnapshots(): void {
  localStorage.removeItem(SNAPSHOT_KEY);
}
