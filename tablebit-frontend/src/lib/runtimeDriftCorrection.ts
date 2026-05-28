let lastCorrection: string | null = null;
let correctionsCount = 0;

export function detectRuntimeDrift(): { drifted: boolean; indicators: string[] } {
  const indicators: string[] = [];
  const now = Date.now();

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("tbit_lock_")) {
      try {
        const val = JSON.parse(localStorage.getItem(key)!);
        if (now - val.timestamp > 60000) indicators.push(`stale lock: ${key}`);
      } catch { indicators.push(`corrupted: ${key}`); }
    }
  }

  return { drifted: indicators.length > 0, indicators };
}

export function correctRuntimeDrift(): number {
  let corrected = 0;
  const keys: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith("tbit_lock_") || key.startsWith("tbit_tx_"))) {
      keys.push(key);
    }
  }

  keys.forEach((key) => {
    try {
      const val = JSON.parse(localStorage.getItem(key)!);
      if (Date.now() - val.timestamp > 60000) {
        localStorage.removeItem(key);
        corrected++;
      }
    } catch {
      localStorage.removeItem(key);
      corrected++;
    }
  });

  if (corrected > 0) {
    correctionsCount++;
    lastCorrection = new Date().toISOString();
  }

  return corrected;
}

export function getDriftMetrics() {
  return { totalCorrections: correctionsCount, lastCorrection };
}
