import { getLifecycleState } from "@/lib/systemLifecycle";
import { isSystemFrozen } from "@/lib/systemFreeze";
import { isLeaderTab } from "@/lib/realtimeLeader";
import { getConnectionState } from "@/lib/realtimeClient";

const VALID_TRANSITIONS: Record<string, string[]> = {
  booting: ["ready"],
  ready: ["degraded", "recovering", "frozen", "shutdown"],
  degraded: ["ready", "recovering", "frozen"],
  recovering: ["ready", "degraded", "frozen"],
  frozen: ["ready"],
  shutdown: [],
};

export function validateSystemState(): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  const lifecycle = getLifecycleState();
  const conn = getConnectionState();
  const frozen = isSystemFrozen();

  if (lifecycle === "ready" && conn === "disconnected") issues.push("ready but disconnected");
  if (lifecycle === "frozen" && !frozen) issues.push("lifecycle frozen but system not");
  if (lifecycle === "shutdown") issues.push("system in shutdown state");

  return { valid: issues.length === 0, issues };
}

export function assertStateConsistency(): void {
  const { valid, issues } = validateSystemState();
  if (!valid) throw new Error(`State inconsistency: ${issues.join(", ")}`);
}
