import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSEO } from "@/hooks/useSEO";
import api from "@/services/api";
import { Loader2, AlertTriangle, AlertCircle, Info, CheckCircle2 } from "lucide-react";

const SEVERITY_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  critical: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" },
  warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10" },
  info: { icon: Info, color: "text-primary", bg: "bg-primary/10" },
};

const AlertsDashboard = () => {
  useSEO({ title: "TableBit - Alertas", description: "Monitoreo de alertas del sistema." });
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("");

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['admin-alerts'],
    queryFn: async () => { const res = await api.get("/admin/alerts"); return res.data; },
    refetchInterval: 30000,
  });

  const resolveMutation = useMutation({
    mutationFn: (id: number) => api.post(`/admin/alerts/resolve/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-alerts'] }),
  });

  const items = Array.isArray(alerts) ? alerts : alerts?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold tracking-tight">Alertas</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitoreo automático del sistema</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-success/60" />
          <p className="text-sm">Sin alertas activas. Sistema funcionando normalmente.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((alert: any) => {
            const cfg = SEVERITY_CONFIG[alert.type] || SEVERITY_CONFIG.info;
            const Icon = cfg.icon;
            return (
              <div key={alert.id} className="rounded-xl border border-border/50 bg-card p-4 flex items-start gap-3 shadow-card">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                  <Icon className={`h-4 w-4 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{alert.source}</span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>{alert.type}</span>
                  </div>
                  <p className="text-sm mt-0.5">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(alert.created_at).toLocaleString("es-ES")}</p>
                </div>
                {alert.status === "active" && (
                  <button onClick={() => resolveMutation.mutate(alert.id)}
                    className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted transition-colors shrink-0">
                    Resolver
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AlertsDashboard;
