let isUnderPressure = false;

export function isMemoryUnderPressure(): boolean {
  return isUnderPressure;
}

export function checkMemoryPressure(): void {
  if ("deviceMemory" in navigator) {
    const mem = (navigator as any).deviceMemory;
    if (mem <= 2) { isUnderPressure = true; return; }
  }
  if ("hardwareConcurrency" in navigator) {
    if (navigator.hardwareConcurrency <= 4) { isUnderPressure = true; return; }
  }
  isUnderPressure = false;
}

checkMemoryPressure();

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) isUnderPressure = true;
    else checkMemoryPressure();
  });
}
