import { getAdaptiveExecutionMetrics } from "@/lib/adaptiveExecution";
import { getStabilizerMetrics } from "@/lib/predictiveStabilizer";

export function getAutonomousMetrics() {
  return {
    execution: getAdaptiveExecutionMetrics(),
    stabilizer: getStabilizerMetrics(),
  };
}
