const VALID_CACHE_NAMES = ["api-cache", "images-cache", "workbox-precache"];

export async function validateCaches(): Promise<{ valid: boolean; issues: string[] }> {
  const issues: string[] = [];
  try {
    const keys = await caches.keys();
    keys.forEach((name) => {
      if (!VALID_CACHE_NAMES.includes(name) && !name.startsWith("workbox-")) {
        issues.push(`Unknown cache: ${name}`);
      }
    });
    VALID_CACHE_NAMES.forEach((name) => {
      if (!keys.includes(name)) issues.push(`Missing cache: ${name}`);
    });
  } catch (e) {
    issues.push(`Cache API error: ${e}`);
  }
  return { valid: issues.length === 0, issues };
}

export async function repairCaches(): Promise<number> {
  let repaired = 0;
  try {
    const keys = await caches.keys();
    for (const key of keys) {
      if (!VALID_CACHE_NAMES.includes(key) && !key.startsWith("workbox-")) {
        await caches.delete(key);
        repaired++;
      }
    }
  } catch { /* ignore */ }
  return repaired;
}
