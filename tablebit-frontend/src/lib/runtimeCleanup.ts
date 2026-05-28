export function cleanupLegacyStorage(): number {
  let cleaned = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.endsWith("_legacy") || key.includes("_deprecated"))) {
      localStorage.removeItem(key);
      cleaned++;
    }
  }
  return cleaned;
}

export function cleanupUnusedCaches(): number {
  let cleaned = 0;
  ["tbit_runtime_learning_legacy", "tbit_old_metrics"].forEach((key) => {
    if (localStorage.getItem(key)) { localStorage.removeItem(key); cleaned++; }
  });
  return cleaned;
}

export function runFullCleanup(): { legacy: number; caches: number } {
  return { legacy: cleanupLegacyStorage(), caches: cleanupUnusedCaches() };
}
