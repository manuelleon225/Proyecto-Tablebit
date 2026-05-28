import { useState } from "react";
import { useSEO } from "@/hooks/useSEO";
import { useObservabilityHub } from "@/hooks/useObservabilityHub";
import { Loader2, Shield, Activity, ImageIcon, AlertTriangle, BarChart3, Radio, Clock } from "lucide-react";

const TABS = ["Resumen", "Audit Logs", "Alertas", "Tiempo Real", "Analíticas"];

const ObservabilityHub = () => {
  useSEO({ title: "TableBit - Centro de control", description: "Monitoreo unificado del sistema." });
  const [tab, setTab] = useState("Resumen");
  const { data, isLoading, error } = useObservabilityHub();

  const healthScore = data?.health_score;
  const summary = data?.summary;
  const activeAlerts = data?.active_alerts || [];
  const recentLogs = data?.recent_logs || [];
  const lastEvents = data?.last_events || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold tracking-tight">Centro de Control</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitoreo unificado del sistema</p>
        </div>
        {isLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border/50 pb-1 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`text-sm px-3 py-2 rounded-t-lg transition-colors whitespace-nowrap ${
              tab === t ? "text-foreground border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
            }`}>{t}</button>
        ))}
      </div>

      {error ? (
        <div className="text-center py-12 text-destructive">Error al cargar datos del sistema</div>
      ) : tab === "Resumen" && data ? (
        <div className="space-y-6">
          {/* Health Score */}
          <div className="rounded-xl border border-border/50 bg-card p-5 shadow-card flex items-center gap-4">
            <div className={`h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold ${
              healthScore.score >= 80 ? "bg-success/10 text-success" : healthScore.score >= 50 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
            }`}>{healthScore.score}</div>
            <div>
              <p className="text-sm font-medium flex items-center gap-2">
                <Shield className={`h-4 w-4 ${healthScore.score >= 80 ? "text-success" : healthScore.score >= 50 ? "text-warning" : "text-destructive"}`} />
                Sistema {healthScore.status === "healthy" ? "saludable" : healthScore.status === "degraded" ? "degradado" : "crítico"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{healthScore.active_critical} críticas · {healthScore.active_warning} warnings · {healthScore.error_rate}% error rate</p>
            </div>
          </div>

          {/* Summary cards */}
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Logs hoy", value: summary.total_logs_today, icon: Activity },
                { label: "Subidas", value: summary.image_uploads_today, icon: ImageIcon },
                { label: "Alertas activas", value: summary.active_alerts, icon: AlertTriangle },
                { label: "Errores", value: summary.error_count, icon: BarChart3 },
              ].map((card) => (
                <div key={card.label} className="rounded-xl border border-border/50 bg-card p-4 shadow-card">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">{card.label}</span>
                    <card.icon className={`h-4 w-4 ${card.value > 0 && card.label === "Errores" ? "text-destructive" : "text-muted-foreground"}`} />
                  </div>
                  <p className="font-display text-xl font-bold">{card.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Recent events */}
          <div className="rounded-xl border border-border/50 bg-card p-5 shadow-card">
            <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-2">
              <Radio className="h-4 w-4 text-muted-foreground" /> Últimos eventos
            </h3>
            <div className="space-y-1 max-h-64 overflow-y-auto font-mono text-xs">
              {lastEvents.slice(0, 20).map((ev: any, i: number) => (
                <div key={i} className="flex items-start gap-2 py-1 border-b border-border/10 last:border-0">
                  <span className="text-muted-foreground shrink-0 w-16">{new Date(ev.timestamp).toLocaleTimeString("es-ES")}</span>
                  <span className={`text-[10px] uppercase font-medium shrink-0 w-12 ${ev.type === "alert" ? "text-destructive" : "text-primary"}`}>{ev.type}</span>
                  <span className="text-foreground/70 truncate">{ev.message || ev.data?.action || "—"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : tab === "Audit Logs" ? (
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/20">
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Fecha</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Acción</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">Usuario</th>
                  <th className="text-left p-3 text-xs font-medium text-muted-foreground">IP</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log: any) => (
                  <tr key={log.id} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
                    <td className="p-3 text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString("es-ES")}</td>
                    <td className="p-3"><span className="inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full border bg-muted/30 border-border/30">{log.action}</span></td>
                    <td className="p-3 text-xs">{log.user?.name || log.user?.email || "—"}</td>
                    <td className="p-3 text-xs text-muted-foreground font-mono">{log.ip_address || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : tab === "Alertas" ? (
        <div className="space-y-2">
          {activeAlerts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-8 w-8 mx-auto mb-2 text-success/60" />
              <p className="text-sm">Sin alertas activas</p>
            </div>
          ) : activeAlerts.map((alert: any) => (
            <div key={alert.id} className="rounded-xl border border-border/50 bg-card p-4 flex items-start gap-3 shadow-card">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${alert.type === "critical" ? "bg-destructive/10" : alert.type === "warning" ? "bg-warning/10" : "bg-primary/10"}`}>
                <AlertTriangle className={`h-4 w-4 ${alert.type === "critical" ? "text-destructive" : alert.type === "warning" ? "text-warning" : "text-primary"}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{alert.source}</span>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${alert.type === "critical" ? "bg-destructive/10 text-destructive" : alert.type === "warning" ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"}`}>{alert.type}</span>
                </div>
                <p className="text-sm mt-0.5">{alert.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(alert.created_at).toLocaleString("es-ES")}</p>
              </div>
            </div>
          ))}
        </div>
      ) : tab === "Tiempo Real" ? (
        <div className="rounded-xl border border-border/50 bg-card p-5 shadow-card">
          <p className="text-sm text-muted-foreground text-center py-8">
            <Radio className="h-6 w-6 mx-auto mb-2 opacity-30" />
            Streaming en vivo disponible en <a href="/dashboard/tiempo-real" className="text-primary hover:underline">Tiempo Real</a>
          </p>
        </div>
      ) : tab === "Analíticas" ? (
        <div className="rounded-xl border border-border/50 bg-card p-5 shadow-card">
          <p className="text-sm text-muted-foreground text-center py-8">
            <BarChart3 className="h-6 w-6 mx-auto mb-2 opacity-30" />
            Analíticas detalladas disponibles en <a href="/dashboard/analiticas" className="text-primary hover:underline">Analíticas</a>
          </p>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground"><Loader2 className="h-6 w-6 mx-auto animate-spin" /></div>
      )}
    </div>
  );
};

export default ObservabilityHub;
