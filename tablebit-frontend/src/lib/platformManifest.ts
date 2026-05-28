import { getKernelState } from "@/lib/runtimeKernel";
import { getConnectionState } from "@/lib/realtimeClient";
import { getRuntimeVersion } from "@/lib/runtimeVersioning";
import { getReleaseChannel } from "@/lib/releaseChannel";
import { getCertificationStatus } from "@/lib/productionCertification";
import { getContractMetrics } from "@/lib/internalContractRegistry";
import { isPlatformFrozen } from "@/lib/platformFreeze";

export function generatePlatformManifest() {
  return {
    platform: { version: "2.0.0", environment: import.meta.env.MODE },
    runtime: { version: getRuntimeVersion(), kernel: getKernelState(), realtime: getConnectionState() },
    release: { channel: getReleaseChannel() },
    governance: { frozen: isPlatformFrozen(), contracts: getContractMetrics() },
    certification: getCertificationStatus(),
    timestamp: new Date().toISOString(),
  };
}
