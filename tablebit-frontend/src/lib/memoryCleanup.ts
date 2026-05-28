let cleanupCount = 0;
let lastCleanup: string | null = null;

export function runMemoryCleanup(): { cleaned: number } {
  let cleaned = 0;

  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith("tbit_") && key.includes("_")) {
        const val = localStorage.getItem(key);
        if (val && val.length > 0) {
          try { JSON.parse(val); } catch {
            localStorage.removeItem(key);
            cleaned++;
          }
        }
      }
    });
  } catch { /* ignore */ }

  cleanupCount++;
  lastCleanup = new Date().toISOString();
  return { cleaned };
}

export function getCleanupMetrics() {
  return { totalCleanups: cleanupCount, lastCleanup };
}

setInterval(() => runMemoryCleanup(), 300000);
