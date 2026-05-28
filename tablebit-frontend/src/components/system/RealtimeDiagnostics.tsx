import { getConnectionState, getLatency, getReconnectCount, getDuplicateEventsPrevented, getAvgPollDuration } from "@/lib/realtimeClient";
import { isLeaderTab } from "@/lib/realtimeLeader";
import { isRealtimeFrozen } from "@/lib/realtimeFreeze";
import { getPresenceMetrics } from "@/lib/presenceSync";
import { useState, useEffect } from "react";
import { connect, disconnect } from "@/lib/realtimeClient";

const RealtimeDiagnostics = () => {
  if (!import.meta.env.DEV) return null;
  const [, forceUpdate] = useState(0);
  useEffect(() => { const i = setInterval(() => forceUpdate((n) => n + 1), 3000); return () => clearInterval(i); }, []);

  return (
    <div className="fixed bottom-4 left-4 z-[9999] bg-card border border-border/50 rounded-xl shadow-elevated p-4 text-xs font-mono max-w-xs space-y-1.5 opacity-80 hover:opacity-100 transition-opacity">
      <p className="font-semibold text-foreground mb-1">🔌 Realtime Diag (DEV)</p>
      <div className="space-y-0.5 text-muted-foreground">
        <p>Status: {getConnectionState()}</p>
        <p>Leader: {isLeaderTab() ? "✅" : "❌"}</p>
        <p>Latency: {getLatency()}ms</p>
        <p>Poll avg: {getAvgPollDuration()}ms</p>
        <p>Reconnects: {getReconnectCount()}</p>
        <p>Duplicates: {getDuplicateEventsPrevented()}</p>
        <p>Presence: {getPresenceMetrics().active ? "✅" : "❌"}</p>
        <p>Freeze: {isRealtimeFrozen() ? "🔒" : "🧊"}</p>
      </div>
      <div className="flex gap-1.5 pt-1">
        <button onClick={() => { disconnect(); setTimeout(() => connect(), 500); }} className="text-[10px] px-2 py-1 rounded bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">Reconnect</button>
      </div>
    </div>
  );
};

export default RealtimeDiagnostics;
