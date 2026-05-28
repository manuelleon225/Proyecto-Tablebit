import { freezePWAArchitecture, isPWAFrozen } from "@/lib/pwaFreeze";
import { freezeRealtimeArchitecture, lockRealtimePipeline, isRealtimeFrozen } from "@/lib/realtimeFreeze";

let systemFrozen = false;

export function freezeSystem(): void {
  systemFrozen = true;
  freezePWAArchitecture();
  freezeRealtimeArchitecture();
  lockRealtimePipeline();
}

export function unfreezeSystem(): void { systemFrozen = false; }
export function isSystemFrozen(): boolean { return systemFrozen; }

export function assertSystemWritable(): void {
  if (systemFrozen) throw new Error("System is frozen. No writes allowed.");
}

export function getFreezeState() {
  return {
    systemFrozen,
    pwaFrozen: isPWAFrozen(),
    realtimeFrozen: isRealtimeFrozen(),
  };
}
