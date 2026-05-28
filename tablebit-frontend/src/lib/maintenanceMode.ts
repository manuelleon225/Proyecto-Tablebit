const STORAGE_KEY = "tbit_maintenance_mode";

export function enableMaintenanceMode(reason: string): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ active: true, reason, timestamp: Date.now() }));
}

export function disableMaintenanceMode(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function isMaintenanceMode(): boolean {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return data.active === true;
  } catch { return false; }
}

export function getMaintenanceReason(): string {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return data.reason || "";
  } catch { return ""; }
}
