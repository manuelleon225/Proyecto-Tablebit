type FailoverMode = "normal" | "degraded" | "emergency";

let currentMode: FailoverMode = "normal";

export function activateFailover(reason: string): FailoverMode {
  currentMode = "degraded";
  return currentMode;
}

export function restoreNormalOperation(): void {
  currentMode = "normal";
}

export function getFailoverMode(): FailoverMode {
  return currentMode;
}

export function isFailoverActive(): boolean {
  return currentMode !== "normal";
}
