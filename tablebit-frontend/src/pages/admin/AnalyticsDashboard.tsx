import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSEO } from "@/hooks/useSEO";
import api from "@/services/api";
import { Loader2, Shield, Activity, ImageIcon, AlertTriangle, TrendingUp, BarChart3 } from "lucide-react";

const HEALTH_COLORS: Record<string, string> = {
  healthy: "text-success",
  degraded: "text-warning",
  critical: "text-destructive",
};

const AnalyticsDashboard = () => {
  useSEO({ title: "TableBit - Analíticas", description: "Métricas históricas del sistema." });
  const [range, setRange] = useState("24h");

  const now = new Date();
  const localDateStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const fromDate = range === "7d" ? localDateStr(new Date(now.getTime() - 7 * 86400000))
    : range === "30d" ? localDateStr(new Date(now.getTime() - 30 * 86400000))
    : localDateStr(new Date(now.getTime() - 86400000));
  const toDate = localDateStr(now);

  const { data: summary } = useQuery({
    queryKey: ['admin-analytics-summary'],
    queryFn: async () => { const res = await api.get("/admin/analytics/summary"); return res.data; },
  });

  const { data: rangeData } = useQuery({
    queryKey: ['admin-analytics-range', fromDate, toDate],
    queryFn: async () => { const res = await api.get("/admin/analytics/range", { params: { from: fromDate, to: toDate } }); return res.data; },
  });

  const { data: healthScore } = useQuery({
    queryKey: ['admin-system-health-score'],
    queryFn: async () => { const res = await api.get("/admin/system-health-score"); return res.data; },
  });

  const kpiCards = summary ? [
    { label: "Logs hoy", value: summary.total_logs_today, icon: Activity, color: "text-primary" },
    { label: "Subidas", value: summary.image_uploads_today, icon: ImageIcon, color: "text-success" },
    { label: "Alertas activas", value: summary.active_alerts, icon: AlertTriangle, color: summary.active_alerts > 0 ? "text-destructive" : "text-muted-foreground" },
    { label: "Errores", value: summary.error_count, icon: BarChart3, color: summary.error_count > 0 ? "text-destructive" : "text-muted-foreground" },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold tracking-tight">Analíticas</h1>
        <p className="text-sm text-muted-foreground mt-1">Métricas históricas del sistema</p>
      </div>

      {/* Health Score */}
      {healthScore && (
        <div className="rounded-xl border border-border/50 bg-card p-5 shadow-card flex items-center gap-4">
          <div className={`h-14 w-14 rounded-full flex items-center justify-center text-2xl font-bold ${
            healthScore.score >= 80 ? "bg-success/10 text-success" : healthScore.score >= 50 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
          }`}>{healthScore.score}</div>
          <div>
            <p className="text-sm font-medium flex items-center gap-2">
              <Shield className={`h-4 w-4 ${HEALTH_COLORS[healthScore.status] || ""}`} />
              Sistema {healthScore.status === "healthy" ? "saludable" : healthScore.status === "degraded" ? "degradado" : "crítico"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{healthScore.active_critical} críticas · {healthScore.active_warning} warnings · {healthScore.error_rate}% error rate</p>
          </div>
        </div>
      )}

      {/* KPIs */}
      {kpiCards.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {kpiCards.map((card) => (
            <div key={card.label} className="rounded-xl border border-border/50 bg-card p-4 shadow-card">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">{card.label}</span>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
              <p className="font-display text-xl font-bold">{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Range data */}
      <div className="flex items-center gap-2">
        {["24h", "7d", "30d"].map((r) => (
          <button key={r} onClick={() => setRange(r)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              range === r ? "bg-primary text-primary-foreground border-primary" : "border-border/50 hover:border-border"
            }`}>{r}</button>
        ))}
      </div>

      {rangeData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Logs by action */}
          <div className="rounded-xl border border-border/50 bg-card p-5 shadow-card">
            <h3 className="font-display text-sm font-semibold mb-3">Logs por acción</h3>
            <div className="space-y-2">
              {(rangeData.logs_by_action || []).map((item: any) => {
                const maxTotal = Math.max(...(rangeData.logs_by_action || []).map((l: any) => l.total), 1);
                const pct = (item.total / maxTotal) * 100;
                return (
                  <div key={item.action} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-28 truncate">{item.action}</span>
                    <div className="flex-1 h-5 bg-muted/30 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-primary/60 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground w-8 text-right">{item.total}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Alerts by type */}
          <div className="rounded-xl border border-border/50 bg-card p-5 shadow-card">
            <h3 className="font-display text-sm font-semibold mb-3">Alertas por tipo</h3>
            <div className="space-y-2">
              {(rangeData.alerts_by_type || []).map((item: any) => {
                const maxTotal = Math.max(...(rangeData.alerts_by_type || []).map((l: any) => l.total), 1);
                const pct = (item.total / maxTotal) * 100;
                return (
                  <div key={item.type} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-28 truncate">{item.type}</span>
                    <div className="flex-1 h-5 bg-muted/30 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${item.type === 'critical' ? 'bg-destructive/60' : item.type === 'warning' ? 'bg-warning/60' : 'bg-primary/60'}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground w-8 text-right">{item.total}</span>
                  </div>
                );
              })}
              {(rangeData.alerts_by_type || []).length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">Sin alertas en este período</p>
              )}
            </div>
          </div>

          {/* Logs by day */}
          <div className="lg:col-span-2 rounded-xl border border-border/50 bg-card p-5 shadow-card">
            <h3 className="font-display text-sm font-semibold mb-3">Logs por día</h3>
            <div className="space-y-1">
              {(rangeData.logs_by_day || []).map((item: any) => {
                const maxTotal = Math.max(...(rangeData.logs_by_day || []).map((l: any) => l.total), 1);
                const pct = (item.total / maxTotal) * 100;
                return (
                  <div key={item.date} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-24">{item.date}</span>
                    <div className="flex-1 h-4 bg-muted/30 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-primary/40 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground w-8 text-right">{item.total}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
