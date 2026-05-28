import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSEO } from "@/hooks/useSEO";
import api from "@/services/api";
import { Loader2, AlertCircle, Shield, Image as ImageIcon, Trash2, RefreshCw } from "lucide-react";

const ACTION_COLORS: Record<string, string> = {
  image_upload: "text-success bg-success/10 border-success/20",
  image_delete: "text-destructive bg-destructive/10 border-destructive/20",
  image_reorder: "text-primary bg-primary/10 border-primary/20",
};

const AuditDashboard = () => {
  useSEO({ title: "TableBit - Auditoría del sistema", description: "Visualiza la actividad del sistema." });

  const [page, setPage] = useState(1);
  const [entityFilter, setEntityFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  const { data: logsData, isLoading } = useQuery({
    queryKey: ['admin-audit-logs', page, entityFilter, actionFilter],
    queryFn: async () => {
      const params: any = { page, per_page: 25 };
      if (entityFilter) params.entity_type = entityFilter;
      if (actionFilter) params.action = actionFilter;
      const res = await api.get("/admin/audit-logs", { params });
      return res.data;
    },
  });

  const { data: health } = useQuery({
    queryKey: ['admin-system-health'],
    queryFn: async () => {
      const res = await api.get("/admin/system-health");
      return res.data;
    },
  });

  const logs = logsData?.data || [];
  const lastPage = logsData?.last_page || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold tracking-tight">Auditoría</h1>
        <p className="text-sm text-muted-foreground mt-1">Actividad del sistema y seguridad</p>
      </div>

      {/* Health cards */}
      {health && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Logs (24h)", value: health.total_logs, icon: Shield, color: "text-primary" },
            { label: "Subidas", value: health.image_uploads, icon: ImageIcon, color: "text-success" },
            { label: "Eliminaciones", value: health.image_deletes, icon: Trash2, color: "text-destructive" },
            { label: "Total imágenes", value: health.total_images, icon: RefreshCw, color: "text-secondary" },
          ].map((card) => (
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

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select value={entityFilter} onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-border/50 bg-card px-3 text-sm">
          <option value="">Todas las entidades</option>
          <option value="restaurante">Restaurante</option>
          <option value="imagen">Imagen</option>
          <option value="usuario">Usuario</option>
        </select>
        <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-lg border border-border/50 bg-card px-3 text-sm">
          <option value="">Todas las acciones</option>
          <option value="image_upload">Image Upload</option>
          <option value="image_delete">Image Delete</option>
          <option value="image_reorder">Image Reorder</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Sin registros de auditoría</p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/20">
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Fecha</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Entidad</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Acción</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">Usuario</th>
                    <th className="text-left p-3 text-xs font-medium text-muted-foreground">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log: any) => {
                    const colorClass = ACTION_COLORS[log.action] || "text-muted-foreground bg-muted/30 border-border/30";
                    return (
                      <tr key={log.id} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                        <td className="p-3 text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString("es-ES")}</td>
                        <td className="p-3 text-xs">{log.entity_type || "—"}</td>
                        <td className="p-3">
                          <span className={`inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full border ${colorClass}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3 text-xs">{log.user?.name || log.user?.email || "—"}</td>
                        <td className="p-3 text-xs text-muted-foreground font-mono">{log.ip_address || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Página {page} de {lastPage}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 rounded-lg border border-border/50 hover:bg-muted transition-colors disabled:opacity-30 text-xs">
                Anterior
              </button>
              <button disabled={page >= lastPage} onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 rounded-lg border border-border/50 hover:bg-muted transition-colors disabled:opacity-30 text-xs">
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AuditDashboard;
