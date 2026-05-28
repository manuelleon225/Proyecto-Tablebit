import { useState, useEffect } from "react";
import { scanTechnicalDebt } from "@/lib/technicalDebtScanner";
import { runFullCleanup } from "@/lib/runtimeCleanup";
import { getContractMetrics } from "@/lib/internalContractRegistry";
import { exportRuntimeArchitecture } from "@/lib/runtimeDocumentationGenerator";
import { getFreezeMetrics } from "@/lib/finalFreezeManager";

const ArchitectureFinalization = () => {
  if (!import.meta.env.DEV) return null;
  const [, forceUpdate] = useState(0);
  useEffect(() => { const i = setInterval(() => forceUpdate((n) => n + 1), 5000); return () => clearInterval(i); }, []);

  const debt = scanTechnicalDebt();
  const contracts = getContractMetrics();

  return (
    <div className="fixed top-4 right-4 z-[9999] bg-card border border-border/50 rounded-xl shadow-elevated p-4 text-xs font-mono max-w-xs space-y-1.5 opacity-80 hover:opacity-100 transition-opacity">
      <p className="font-semibold text-foreground mb-1">🏁 Arch Finalization (DEV)</p>
      <div className="space-y-0.5 text-muted-foreground">
        <p>Contracts: {contracts.frozen}/{contracts.total} frozen</p>
        <p>Debt: {debt.score}/100 ({debt.issues.length} issues)</p>
        <p>Freeze: {getFreezeMetrics().integrity ? "✅" : "❌"}</p>
      </div>
      <div className="flex gap-1.5 pt-1">
        <button onClick={() => { runFullCleanup(); forceUpdate((n) => n + 1); }} className="text-[10px] px-2 py-1 rounded bg-warning/10 text-warning hover:bg-warning/20 transition-colors">Cleanup</button>
        <button onClick={() => { console.log(exportRuntimeArchitecture()); }} className="text-[10px] px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors">Docs</button>
      </div>
    </div>
  );
};

export default ArchitectureFinalization;
