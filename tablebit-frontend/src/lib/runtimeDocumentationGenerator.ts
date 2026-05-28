import { getKernelState } from "@/lib/runtimeKernel";
import { getConnectionState } from "@/lib/realtimeClient";
import { isPlatformFrozen } from "@/lib/platformFreeze";
import { getCertificationStatus } from "@/lib/productionCertification";
import { getContractMetrics } from "@/lib/internalContractRegistry";

export function generateRuntimeDocs(): Record<string, any> {
  return {
    kernel: { state: getKernelState() },
    realtime: { connection: getConnectionState() },
    platform: { frozen: isPlatformFrozen() },
    certification: getCertificationStatus(),
    contracts: getContractMetrics(),
    timestamp: new Date().toISOString(),
  };
}

export function exportRuntimeArchitecture(): string {
  return JSON.stringify(generateRuntimeDocs(), null, 2);
}
