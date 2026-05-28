import { useState, useEffect } from "react";
import { validateDeploymentReadiness, getCurrentBuild } from "@/lib/deploymentManager";
import { getReleaseChannel } from "@/lib/releaseChannel";
import { isMaintenanceMode } from "@/lib/maintenanceMode";
import { getRollbackPoints } from "@/lib/releaseRollback";
import { getRuntimeVersion } from "@/lib/runtimeVersioning";
import { runProductionCertification } from "@/lib/productionCertification";

const ProductionOperations = () => {
  if (!import.meta.env.DEV) return null;
  const [, forceUpdate] = useState(0);
  useEffect(() => { const i = setInterval(() => forceUpdate((n) => n + 1), 5000); return () => clearInterval(i); }, []);

  const readiness = validateDeploymentReadiness();
  const cert = runProductionCertification();

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] bg-card border border-border/50 rounded-xl shadow-elevated p-4 text-xs font-mono max-w-md space-y-1.5 opacity-80 hover:opacity-100 transition-opacity">
      <p className="font-semibold text-foreground mb-1">🚀 Operations (DEV)</p>
      <div className="space-y-0.5 text-muted-foreground">
        <p>Build: {getCurrentBuild()} | Runtime: {getRuntimeVersion()}</p>
        <p>Release: {getReleaseChannel()} | Cert: {cert.passed ? "✅" : "❌"}</p>
        <p>Deploy: {readiness.ready ? "✅" : "⚠️"} | Score: {readiness.score}</p>
        <p>Maintenance: {isMaintenanceMode() ? "🔧" : "✅"}</p>
        <p>Rollback points: {getRollbackPoints().length}</p>
      </div>
    </div>
  );
};

export default ProductionOperations;
