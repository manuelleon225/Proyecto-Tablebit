let frozen = false;
let pipelineLocked = false;

export function freezeRealtimeArchitecture(): void { frozen = true; }
export function isRealtimeFrozen(): boolean { return frozen; }
export function assertRealtimeFrozen(): void {
  if (frozen) throw new Error("Realtime architecture is frozen");
}

export function lockRealtimePipeline(): void { pipelineLocked = true; }
export function isPipelineLocked(): boolean { return pipelineLocked; }
export function assertPipelineLocked(): void {
  if (pipelineLocked) throw new Error("Realtime pipeline is locked");
}

export function getRealtimeFreezeState() {
  return { frozen, pipelineLocked };
}
