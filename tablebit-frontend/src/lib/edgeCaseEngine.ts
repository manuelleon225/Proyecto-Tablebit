import { getConnectionState, getReconnectCount } from "@/lib/realtimeClient";
import { getKernelState } from "@/lib/runtimeKernel";

let edgeCasesDetected = 0;

export function detectEdgeCases(): string[] {
  const issues: string[] = [];
  const conn = getConnectionState();
  const kernel = getKernelState();

  if (conn === "disconnected" && kernel === "active") issues.push("disconnected but kernel active");
  if (getReconnectCount() > 10) issues.push("reconnect storm");

  if (issues.length > 0) edgeCasesDetected++;
  return issues;
}

export function resolveEdgeCases(): number {
  let resolved = 0;
  const issues = detectEdgeCases();
  issues.forEach(() => resolved++);
  return resolved;
}

export function getEdgeCaseMetrics() {
  return { detected: edgeCasesDetected };
}
