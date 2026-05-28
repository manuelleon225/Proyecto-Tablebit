function hash(value: string): string {
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = ((h << 5) - h) + value.charCodeAt(i);
    h |= 0;
  }
  return String(h);
}

export function secureSet(key: string, value: any): void {
  try {
    const json = JSON.stringify(value);
    const checksum = hash(json);
    localStorage.setItem(key, json);
    localStorage.setItem(`${key}_cs`, checksum);
  } catch { /* storage full */ }
}

export function secureGet<T>(key: string): T | null {
  try {
    const json = localStorage.getItem(key);
    const checksum = localStorage.getItem(`${key}_cs`);
    if (!json || !checksum) return null;
    if (hash(json) !== checksum) {
      localStorage.removeItem(key);
      localStorage.removeItem(`${key}_cs`);
      return null;
    }
    return JSON.parse(json) as T;
  } catch {
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}_cs`);
    return null;
  }
}

export function secureRemove(key: string): void {
  localStorage.removeItem(key);
  localStorage.removeItem(`${key}_cs`);
}

export function validateStorageIntegrity(): { valid: boolean; corrupted: number } {
  let corrupted = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && !key.endsWith("_cs")) {
      const json = localStorage.getItem(key);
      const cs = localStorage.getItem(`${key}_cs`);
      if (cs && json && hash(json) !== cs) corrupted++;
    }
  }
  return { valid: corrupted === 0, corrupted };
}
