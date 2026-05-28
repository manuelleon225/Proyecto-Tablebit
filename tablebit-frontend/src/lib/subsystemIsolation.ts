interface IsolatedSubsystem {
  name: string;
  isolatedAt: number;
  reason: string;
}

const isolated = new Map<string, IsolatedSubsystem>();
const STORAGE_KEY = "tbit_isolated_subsystems";

function persist(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(isolated.values())));
}

function load(): void {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    data.forEach((s: IsolatedSubsystem) => isolated.set(s.name, s));
  } catch { /* ignore */ }
}

load();

export function isolateSubsystem(name: string, reason: string): void {
  isolated.set(name, { name, isolatedAt: Date.now(), reason });
  persist();
}

export function restoreSubsystem(name: string): void {
  isolated.delete(name);
  persist();
}

export function getIsolationState(): { isolated: string[]; count: number } {
  const names = Array.from(isolated.keys());
  return { isolated: names, count: names.length };
}

export function isSubsystemIsolated(name: string): boolean {
  return isolated.has(name);
}
