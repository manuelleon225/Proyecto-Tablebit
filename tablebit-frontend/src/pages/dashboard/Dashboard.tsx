import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/layouts/DashboardLayout";
import { restauranteService, type Reserva } from "@/services/restauranteService";
import { CalendarDays, Users, UtensilsCrossed, TrendingUp, AlertCircle, Clock, XCircle, CheckCircle2, Ban, Percent } from "lucide-react";
import { useRestaurante } from "@/context/RestauranteContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import { DashboardCard } from "@/components/ui/dashboard-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ActivityFeed } from "@/components/notifications/ActivityFeed";
import { Waitlist } from "@/components/waitlist/Waitlist";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const Dashboard = () => {
  const { selectedRestauranteId, setSelectedRestauranteId, misRestaurantes, restauranteActual } = useRestaurante();

  useSEO({ title: "TableBit - Dashboard", description: "Panel de administración de TableBit." });

  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useQuery({
    queryKey: ['dashboard-analytics', selectedRestauranteId],
    queryFn: async () => { const res = await restauranteService.getDashboard(selectedRestauranteId!); return res.data; },
    enabled: !!selectedRestauranteId,
    staleTime: 2 * 60 * 1000,
  });

  const { data: proximasReservas = [], isLoading: reservasLoading } = useQuery({
    queryKey: ['dashboard-proximas-reservas', selectedRestauranteId],
    queryFn: async () => {
      const res = await restauranteService.getReservas({ restaurante_id: selectedRestauranteId!, fecha: new Date().toISOString().split("T")[0], per_page: 10 });
      const data = res.data;
      return (Array.isArray(data) ? data : (data.data || [])).filter((r: Reserva) => ["pendiente", "confirmada"].includes(r.estado)).slice(0, 5);
    },
    enabled: !!selectedRestauranteId,
    staleTime: 2 * 60 * 1000,
  });

  const isLoadingInitial = !selectedRestauranteId && misRestaurantes.length === 0;

  const statCards = [
    { label: "Reservas hoy", value: analytics?.reservas_hoy ?? 0, icon: CalendarDays, subtext: `${analytics?.confirmadas ?? 0} confirmadas`, accent: "text-primary", bgIcon: "bg-primary/10", trend: analytics?.reservas_hoy ? { value: 12, positive: true } : undefined },
    { label: "Ocupación", value: `${analytics?.ocupacion_hoy ?? 0}%`, icon: Percent, subtext: `${analytics?.mesas_ocupadas_hoy ?? 0}/${analytics?.mesas_totales ?? 0} mesas`, accent: "text-success", bgIcon: "bg-success/10", trend: analytics?.ocupacion_hoy ? { value: Math.floor(analytics.ocupacion_hoy / 10), positive: analytics.ocupacion_hoy > 50 } : undefined },
    { label: "Personas promedio", value: analytics?.personas_promedio ?? 0, icon: Users, subtext: "Por reserva", accent: "text-secondary", bgIcon: "bg-secondary/10" },
    { label: "Cancelaciones", value: analytics?.canceladas ?? 0, icon: XCircle, subtext: `${analytics?.no_shows ?? 0} no-shows · ${analytics?.tasa_cancelacion ?? 0}% tasa`, accent: analytics && (analytics.tasa_cancelacion > 20) ? "text-destructive" : "text-muted-foreground", bgIcon: analytics && (analytics.tasa_cancelacion > 20) ? "bg-destructive/10" : "bg-muted/50" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">{restauranteActual?.nombre || (isLoadingInitial ? "Cargando..." : "Panel de control")}</p>
          </div>
          <div className="flex items-center gap-2">
            {misRestaurantes.length > 1 && (
              <Select value={String(selectedRestauranteId)} onValueChange={(v) => setSelectedRestauranteId(Number(v))}>
                <SelectTrigger className="w-44 h-9 bg-card/50 backdrop-blur-sm border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {misRestaurantes.map((r: { id: number; nombre: string }) => (
                    <SelectItem key={r.id} value={String(r.id)}>{r.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button variant="outline" size="sm" asChild className="h-9">
              <Link to="/dashboard/calendario"><CalendarDays className="h-4 w-4 mr-1.5" /> Calendario</Link>
            </Button>
          </div>
        </div>

        {isLoadingInitial ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border/50 bg-card p-5 animate-pulse">
                <div className="h-3 w-20 bg-muted rounded mb-3" />
                <div className="h-8 w-16 bg-muted rounded mb-2" />
                <div className="h-3 w-24 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : !selectedRestauranteId ? (
          <EmptyState icon={AlertCircle} title="Sin restaurante asociado" description="No tienes un restaurante vinculado a tu cuenta. Contacta al administrador." />
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {analyticsLoading ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border/50 bg-card p-5 animate-pulse">
                  <div className="h-3 w-20 bg-muted rounded mb-3" />
                  <div className="h-8 w-16 bg-muted rounded mb-2" />
                  <div className="h-3 w-24 bg-muted rounded" />
                </div>
              )) : analyticsError ? (
                <div className="col-span-full rounded-xl border border-border/50 bg-card p-6 text-center">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive/50" />
                  <p className="text-sm text-muted-foreground">Error al cargar métricas</p>
                  <Button variant="outline" size="sm" className="mt-3">Reintentar</Button>
                </div>
              ) : statCards.map((s, i) => (
                <DashboardCard key={s.label} {...s} style={{ animationDelay: `${i * 75}ms` }} className="animate-fade-in" />
              ))}
            </div>

            {/* Activity + Waitlist */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border/50 bg-card p-5 shadow-card">
                <h2 className="font-display text-base font-semibold mb-3 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                  </span>
                  Actividad reciente
                </h2>
                <ActivityFeed />
              </div>
              <Waitlist />
            </div>

            {/* Horas pico + Métricas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border/50 bg-card p-5 shadow-card">
                <h2 className="font-display text-base font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" /> Horas pico
                </h2>
                {analytics?.horas_pico && analytics.horas_pico.length > 0 ? (
                  <div className="space-y-2">
                    {analytics.horas_pico.map((h: { hora: number; total: number }, idx: number) => {
                      const maxTotal = Math.max(...analytics.horas_pico.map((x: { total: number }) => x.total));
                      const width = maxTotal > 0 ? (h.total / maxTotal) * 100 : 0;
                      return (
                        <div key={h.hora} className="flex items-center gap-3">
                          <span className="text-xs font-medium w-10 text-right text-muted-foreground">{String(h.hora).padStart(2, "0")}:00</span>
                          <div className="flex-1 h-5 bg-muted/30 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${width}%`, background: `linear-gradient(90deg, hsl(142, 76%, ${55 + idx * 10}%), hsl(142, 70%, ${40 + idx * 10}%))` }} />
                          </div>
                          <span className="text-xs font-medium text-muted-foreground w-6 text-right">{h.total}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : <p className="text-sm text-muted-foreground text-center py-8">Sin datos aún</p>}
              </div>

              <div className="rounded-xl border border-border/50 bg-card p-5 shadow-card">
                <h2 className="font-display text-base font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" /> Métricas del período
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Completadas", value: analytics?.completadas ?? 0, icon: CheckCircle2, color: "text-success", bg: "bg-success/5 border-success/10" },
                    { label: "Canceladas", value: analytics?.canceladas ?? 0, icon: XCircle, color: "text-destructive", bg: "bg-destructive/5 border-destructive/10" },
                    { label: "No-shows", value: analytics?.no_shows ?? 0, icon: Ban, color: "text-muted-foreground", bg: "bg-muted/30 border-border" },
                    { label: "Total período", value: analytics?.total_reservas_periodo ?? 0, icon: UtensilsCrossed, color: "text-primary", bg: "bg-primary/5 border-primary/10" },
                  ].map((m) => (
                    <div key={m.label} className={`p-4 rounded-lg ${m.bg} border`}>
                      <div className="flex items-center gap-2 mb-1">
                        <m.icon className={`h-4 w-4 ${m.color}`} />
                        <span className="text-xs text-muted-foreground">{m.label}</span>
                      </div>
                      <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Reservas de hoy */}
            <div className="rounded-xl border border-border/50 bg-card p-5 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-base font-semibold">Reservas de hoy</h2>
                <Button variant="ghost" size="sm" asChild><Link to="/dashboard/reservas">Ver todas</Link></Button>
              </div>
              {reservasLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 py-3 px-4 animate-pulse">
                      <div className="h-10 w-10 rounded-lg bg-muted" />
                      <div className="flex-1 space-y-2"><div className="h-4 w-32 bg-muted rounded" /><div className="h-3 w-48 bg-muted rounded" /></div>
                    </div>
                  ))}
                </div>
              ) : proximasReservas.length === 0 ? (
                <div className="text-center py-10"><Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground/20" /><p className="text-sm text-muted-foreground">No hay reservas para hoy</p></div>
              ) : (
                <div className="space-y-2">
                  {proximasReservas.map((r: Reserva) => {
                    const isPast = r.hora && r.hora.substring(0, 5) < new Date().toTimeString().substring(0, 5);
                    return (
                      <div key={r.id} className="flex items-center justify-between py-3 px-4 rounded-xl bg-card border border-border/30 hover:border-border hover:shadow-sm transition-all">
                        <div className="flex items-center gap-3">
                          <div className={`relative h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isPast ? 'bg-muted/30' : 'bg-primary/10'}`}>
                            <Clock className={`h-4 w-4 ${isPast ? 'text-muted-foreground/50' : 'text-primary'}`} />
                            {!isPast && <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success animate-pulse" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{r.cliente?.name || `Cliente #${r.cliente_id}`}</p>
                            <p className="text-xs text-muted-foreground">{r.hora?.substring(0, 5)} · {r.cantidad_personas} persona{r.cantidad_personas !== 1 ? "s" : ""}{r.mesa && ` · Mesa ${r.mesa.numero}`}</p>
                          </div>
                        </div>
                        <StatusBadge estado={r.estado} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
