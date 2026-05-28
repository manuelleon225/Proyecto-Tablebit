const RUNTIME_VERSION = "2.0.0";

export function getRuntimeVersion(): string { return RUNTIME_VERSION; }

export function validateRuntimeCompatibility(): boolean {
  const cached = localStorage.getItem("tbit_runtime_version");
  return !cached || cached === RUNTIME_VERSION;
}

export function compareVersions(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) > (pb[i] || 0)) return 1;
    if ((pa[i] || 0) < (pb[i] || 0)) return -1;
  }
  return 0;
}

export function migrateRuntimeState(): void {
  localStorage.setItem("tbit_runtime_version", RUNTIME_VERSION);
}
