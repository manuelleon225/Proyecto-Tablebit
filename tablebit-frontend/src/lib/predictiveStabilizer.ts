import { getSystemHealthScore } from "@/lib/systemHealthEngine";
import { getReconnectCount } from "@/lib/realtimeClient";

let stabilizations = 0;

export function runPredictiveStabilization(): string[] {
  const actions: string[] = [];
  const health = getSystemHealthScore();
  const reconnects = getReconnectCount();

  if (reconnects > 3) actions.push("reduce-polling");
  if (health < 60) actions.push("reduce-concurrency");
  if (health < 40) actions.push("defer-low-tasks");

  if (actions.length > 0) stabilizations++;
  return actions;
}

export function preventInstability(): boolean {
  const actions = runPredictiveStabilization();
  return actions.length === 0;
}

export function getStabilizerMetrics() {
  return { totalStabilizations: stabilizations };
}
