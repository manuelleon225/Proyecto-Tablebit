type LifecycleState = "booting" | "ready" | "degraded" | "recovering" | "frozen" | "shutdown";
type LifecycleCallback = (state: LifecycleState) => void;

let currentState: LifecycleState = "booting";
const listeners = new Set<LifecycleCallback>();

export function setLifecycleState(state: LifecycleState): void {
  currentState = state;
  listeners.forEach((cb) => cb(state));
}

export function getLifecycleState(): LifecycleState { return currentState; }
export function subscribeLifecycle(cb: LifecycleCallback): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
