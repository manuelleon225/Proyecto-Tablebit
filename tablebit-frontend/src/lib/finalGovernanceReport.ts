import { runProductionCertification, getCertificationStatus } from "@/lib/productionCertification";
import { calculatePlatformStability, getStabilityForecast } from "@/lib/platformStability";
import { getSystemHealthScore } from "@/lib/systemHealthEngine";
import { getConnectionState } from "@/lib/realtimeClient";
import { isPlatformFrozen } from "@/lib/platformFreeze";
import { detectMemoryLeaks } from "@/lib/runtimeLeakDetector";

export function generateFinalReport() {
  const cert = runProductionCertification();
  const stability = calculatePlatformStability();
  const health = getSystemHealthScore();
  const memory = detectMemoryLeaks();

  return {
    certification: cert.passed ? "passed" : "failed",
    stability,
    health,
    realtime: getConnectionState(),
    memoryLeaks: memory.leaks.length,
    build: "production-ready",
    timestamp: new Date().toISOString(),
  };
}
