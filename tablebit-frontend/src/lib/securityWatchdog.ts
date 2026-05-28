import { getInvalidEventCount } from "@/lib/eventIntegrity";
import { clearRequestHistory } from "@/lib/requestGuard";
import { validateStorageIntegrity } from "@/lib/secureStorage";
import { validateSystemState } from "@/lib/stateValidator";

let active = false;
let corruptionCount = 0;
let replayBlocks = 0;

export function startSecurityWatchdog(): void {
  if (active) return;
  active = true;

  setInterval(() => {
    const storage = validateStorageIntegrity();
    if (!storage.valid) corruptionCount += storage.corrupted;

    const state = validateSystemState();
    if (!state.valid) corruptionCount++;

    const invalidEvents = getInvalidEventCount();
    if (invalidEvents > 100) {
      clearRequestHistory();
      replayBlocks++;
    }
  }, 60000);
}

export function getSecurityMetrics() {
  return {
    active,
    corruptionCount,
    replayBlocks,
    invalidEvents: getInvalidEventCount(),
  };
}
