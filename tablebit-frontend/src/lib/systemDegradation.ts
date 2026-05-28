let isDegraded = false;
let degradeReason = "";

export function checkDegradation(): void {
  if ((navigator as any).deviceMemory !== undefined && (navigator as any).deviceMemory <= 2) {
    isDegraded = true;
    degradeReason = "low-memory";
    return;
  }
  if (navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 4) {
    isDegraded = true;
    degradeReason = "low-cpu";
    return;
  }
  isDegraded = false;
  degradeReason = "";
}

export function isSystemDegraded(): boolean { return isDegraded; }
export function getDegradeReason(): string { return degradeReason; }
