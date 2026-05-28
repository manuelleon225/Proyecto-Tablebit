import { useState, useEffect } from "react";
import { getUptimeMetrics } from "@/lib/uptimeMonitor";
import { getSystemHealthScore } from "@/lib/systemHealthEngine";
import { getErrorSummary } from "@/lib/errorAggregation";

const PostProductionPanel = () => {
  if (!import.meta.env.DEV) return null;
  const [, forceUpdate] = useState(0);
  useEffect(() => { const i = setInterval(() => forceUpdate((n) => n + 1), 5000); return () => clearInterval(i); }, []);

  const uptime = getUptimeMetrics();
  const errors = getErrorSummary();

  return (
    <div className="fixed bottom-4 left-4 z-[9999] bg-card border border-border/50 rounded-xl shadow-elevated p-4 text-xs font-mono max-w-xs space-y-1.5 opacity-80 hover:opacity-100 transition-opacity">
      <p className="font-semibold text-foreground mb-1">🌍 Post-Production (DEV)</p>
      <div className="space-y-0.5 text-muted-foreground">
        <p>Health: {getSystemHealthScore()}/100</p>
        <p>Uptime: {uptime.availability}%</p>
        <p>Session: {uptime.uptimeHours}h</p>
        <p>Errors: {Object.keys(errors).length > 0 ? Object.entries(errors).map(([k, v]) => `${k}:${v}`).join(" | ") : "none"}</p>
      </div>
    </div>
  );
};

export default PostProductionPanel;
