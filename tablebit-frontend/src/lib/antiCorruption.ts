import { getLifecycleState, setLifecycleState } from "@/lib/systemLifecycle";
import type { LifecycleState } from "@/lib/systemLifecycle";

const VALID_TRANSITIONS: Record<string, string[]> = {
  booting: ["ready"],
  ready: ["degraded", "recovering", "frozen", "shutdown"],
  degraded: ["ready", "recovering", "frozen"],
  recovering: ["ready", "degraded", "frozen"],
  frozen: ["ready"],
  shutdown: [],
};

export function safeTransition(target: LifecycleState): boolean {
  const current = getLifecycleState();
  const allowed = VALID_TRANSITIONS[current];
  if (!allowed || !allowed.includes(target)) return false;
  setLifecycleState(target);
  return true;
}

export function assertValidState(state: LifecycleState): void {
  if (!["booting", "ready", "degraded", "recovering", "frozen", "shutdown"].includes(state)) {
    throw new Error(`Invalid lifecycle state: ${state}`);
  }
}
