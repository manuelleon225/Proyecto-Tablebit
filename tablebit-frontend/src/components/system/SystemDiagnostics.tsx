import { useState, useEffect } from "react";
import { runGlobalHealthCheck, recoverAll } from "@/lib/systemOrchestrator";
import { setLifecycleState } from "@/lib/systemLifecycle";

const SystemDiagnostics = () => {
  if (!import.meta.env.DEV) return null;
  const [, forceUpdate] = useState(0);
  useEffect(() => { const i = setInterval(() => forceUpdate((n) => n + 1), 5000); return () => clearInterval(i); }, []);
  const health = runGlobalHealthCheck();

  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-card border border-border/50 rounded-xl shadow-elevated p-4 text-xs font-mono w-72 space-y-2 opacity-80 hover:opacity-100 transition-opacity">
      <p className="font-semibold text-foreground mb-1">🧠 System Diag (DEV)</p>
      <div className="space-y-0.5 text-muted-foreground">
        <p>Health: {health.score}/100 ({health.level})</p>
        <p>Lifecycle: {health.lifecycle}</p>
        <p>Freeze: {health.frozen ? "🔒" : "🧊"}</p>
        <p>Degraded: {health.degraded ? `⚠️ ${health.degradeReason}` : "✅"}</p>
        <p>Recovery: {health.recovery.attempts} attempts</p>
      </div>
      <div className="flex gap-1.5 pt-1">
        <button onClick={() => { setLifecycleState("ready"); forceUpdate((n) => n + 1); }} className="text-[10px] px-2 py-1 rounded bg-success/10 text-success hover:bg-success/20 transition-colors">Ready</button>
        <button onClick={() => { recoverAll(); }} className="text-[10px] px-2 py-1 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">Recover</button>
      </div>
    </div>
  );
};

export default SystemDiagnostics;
