import { useState } from "react";
import { useSEO } from "@/hooks/useSEO";
import { useRealtimeStream } from "@/hooks/useRealtimeStream";
import { Loader2, Radio, Pause, Play, AlertTriangle, Activity, ImageIcon, Shield } from "lucide-react";

const EVENT_CONFIG: Record<string, { icon: any; color: string }> = {
  audit: { icon: Activity, color: "text-primary" },
  alert: { icon: AlertTriangle, color: "text-destructive" },
  image: { icon: ImageIcon, color: "text-success" },
};

const LiveStreamDashboard = () => {
  useSEO({ title: "TableBit - Tiempo real", description: "Monitoreo en vivo del sistema." });
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const { events, isConnected, isPaused, pause, resume } = useRealtimeStream(
    typeFilter ? [typeFilter] : undefined
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold tracking-tight">Tiempo Real</h1>
          <p className="text-sm text-muted-foreground mt-1">Actividad del sistema en vivo</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-1.5 text-xs ${isConnected ? "text-success" : "text-destructive"}`}>
            <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-success animate-pulse" : "bg-destructive"}`} />
            {isConnected ? "Conectado" : "Desconectado"}
          </span>
          <button onClick={isPaused ? resume : pause}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors" aria-label={isPaused ? "Reanudar" : "Pausar"}>
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[null, "audit", "alert", "image"].map((type) => (
          <button key={type || "all"} onClick={() => setTypeFilter(type)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              typeFilter === type ? "bg-primary text-primary-foreground border-primary" : "border-border/50 hover:border-border"
            }`}>
            {type || "Todos"}
          </button>
        ))}
      </div>

      {/* Stream feed */}
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
        <div className="h-[60vh] overflow-y-auto p-4 space-y-1 font-mono text-xs">
          {isPaused && (
            <div className="text-center text-muted-foreground py-8">
              <Pause className="h-6 w-6 mx-auto mb-2 opacity-30" />
              <p>Stream en pausa</p>
            </div>
          )}
          {events.length === 0 && !isPaused ? (
            <div className="text-center text-muted-foreground py-12">
              <Radio className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p>Esperando eventos...</p>
            </div>
          ) : (
            events.map((ev, i) => {
              const cfg = EVENT_CONFIG[ev.type] || { icon: Activity, color: "text-muted-foreground" };
              const Icon = cfg.icon;
              return (
                <div key={`${ev.timestamp}-${i}`} className="flex items-start gap-2 py-1.5 border-b border-border/20 last:border-0">
                  <Icon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${cfg.color}`} />
                  <span className="text-muted-foreground shrink-0 w-16">{new Date(ev.timestamp).toLocaleTimeString("es-ES")}</span>
                  <span className={`text-[10px] uppercase font-medium shrink-0 w-12 ${cfg.color}`}>{ev.type}</span>
                  <span className="text-foreground/80 truncate">{ev.data?.message || ev.data?.action || JSON.stringify(ev.data).slice(0, 120)}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveStreamDashboard;
