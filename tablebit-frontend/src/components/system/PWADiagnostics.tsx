import { useServiceWorkerUpdates } from "@/hooks/useServiceWorkerUpdates";
import { getQueueMetrics, getDeadLetterCount } from "@/lib/offlineQueue";
import { getPWAMetrics } from "@/lib/pwaMetrics";
import { getStorageUsage } from "@/lib/cacheStorageGuard";
import { getSWState } from "@/lib/swLifecycleManager";
import { isMemoryUnderPressure } from "@/lib/memoryPressure";
import { isPWAFrozen } from "@/lib/pwaFreeze";
import { useState, useEffect } from "react";
import { resetPWAEnvironment } from "@/lib/pwaRecovery";

const PWADiagnostics = () => {
  if (!import.meta.env.DEV) return null;

  const { updateAvailable, checkForUpdates } = useServiceWorkerUpdates();
  const [storage, setStorage] = useState({ usage: 0, quota: 0, percent: 0 });

  useEffect(() => { getStorageUsage().then(setStorage); }, []);

  const metrics = getPWAMetrics();
  const queueMetrics = getQueueMetrics();

  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-card border border-border/50 rounded-xl shadow-elevated p-4 text-xs font-mono max-w-xs space-y-2 opacity-80 hover:opacity-100 transition-opacity">
      <p className="font-semibold text-foreground mb-1">🧪 PWA Diag (DEV)</p>
      <div className="space-y-0.5 text-muted-foreground">
        <p>SW: {getSWState()} {updateAvailable ? "⚠️" : "✅"}</p>
        <p>Cache: {metrics.cacheHitRate}%</p>
        <p>Queue: {queueMetrics.queuedCount}p · dead: {getDeadLetterCount()}</p>
        <p>Storage: {storage.percent}%</p>
        <p>Memory: {isMemoryUnderPressure() ? "⚠️ pressure" : "✅ ok"}</p>
        <p>Freeze: {isPWAFrozen() ? "🔒 frozen" : "🧊 active"}</p>
      </div>
      <div className="flex gap-1.5 pt-1">
        <button onClick={() => resetPWAEnvironment()} className="text-[10px] px-2 py-1 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">Reset</button>
        <button onClick={checkForUpdates} className="text-[10px] px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors">Check SW</button>
      </div>
    </div>
  );
};

export default PWADiagnostics;
