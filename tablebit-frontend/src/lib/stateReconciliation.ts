import { validateStorageIntegrity } from "@/lib/secureStorage";
import { validateSystemState } from "@/lib/stateValidator";
import { validateCaches } from "@/lib/cacheConsistency";

export async function reconcileState(): Promise<{ repairs: number }> {
  let repairs = 0;

  const storage = validateStorageIntegrity();
  if (!storage.valid) repairs += storage.corrupted;

  const state = validateSystemState();
  if (!state.valid) repairs++;

  try {
    const caches = await validateCaches();
    if (!caches.valid) repairs++;
  } catch { repairs++; }

  return { repairs };
}

export async function detectStateDrift(): Promise<{ drifted: boolean; areas: string[] }> {
  const areas: string[] = [];
  const storage = validateStorageIntegrity();
  if (!storage.valid) areas.push("storage");
  const state = validateSystemState();
  if (!state.valid) areas.push("system state");
  return { drifted: areas.length > 0, areas };
}
