import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { restauranteService } from "@/services/restauranteService";
import type { Reserva } from "@/types/restaurante";
import { CalendarDays, Users, Clock, TrendingUp, AlertCircle, Table2, Plus, ChevronRight, UtensilsCrossed, BarChart3, ImageIcon, Settings } from "lucide-react";
import { useRestaurante } from "@/context/RestauranteContext";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import { StatusBadge } from "@/components/ui/status-badge";

const statCard = (icon: React.ElementType, label: string, value: string | number, sub: string, color: string) => {
  const Icon = icon;
  return (
    <div className="relative overflow-hidden rounded-xl bg-card border border-border/40 p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:border-border/60">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">{label}</span>
        <div className={`h-8 w-8 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </div>
      <p className="font-display text-2xl font-bold tracking-tight text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
    </div>
  );
};

const Dashboard = () => {
  const { selectedRestauranteId, misRestaurantes, restauranteActual, isLoading } = useRestaurante();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (!selectedRestauranteId && misRestaurantes.length === 0) {
      navigate("/onboarding/restaurante", { replace: true });
    }
  }, [selectedRestauranteId, misRestaurantes.length, navigate, isLoading]);

  useSEO({ title: "TableBit - Dashboard", description: "Panel de administración de TableBit." });

  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useQuery({
    queryKey: ['dashboard-analytics', selectedRestauranteId],
    queryFn: async () => { const res = await restauranteService.getDashboard(selectedRestauranteId!); return res.data; },
    enabled: !!selectedRestauranteId,
    staleTime: 2 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  const { data: proximasReservas = [], isLoading: reservasLoading } = useQuery({
    queryKey: ['dashboard-proximas-reservas', selectedRestauranteId],
    queryFn: async () => {
      const now = new Date();
      const todayLocal = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const res = await restauranteService.getReservas({ restaurante_id: selectedRestauranteId!, fecha: todayLocal, per_page: 10 });
      const data = res.data;
      return (Array.isArray(data) ? data : (data.data || [])).filter((r: Reserva) => ["pendiente", "confirmada"].includes(r.estado)).slice(0, 5);
    },
    enabled: !!selectedRestauranteId,
    staleTime: 2 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  const isLoadingInitial = isLoading || (!selectedRestauranteId && misRestaurantes.length === 0);

  const checklistDismissedKey = `tablebit.onboarding_dismissed_${selectedRestauranteId}`;
  const [checklistDismissed, setChecklistDismissed] = useState(() => localStorage.getItem(checklistDismissedKey) === "true");

  const pendingSetupSteps = [
    { id: "mesas", label: "Agrega tu primera mesa", done: (analytics?.mesas_totales ?? 0) > 0, cta: { label: "Crear mesa", to: "/dashboard/mesas" } },
    { id: "horarios", label: "Configura horarios de apertura", done: !!(restauranteActual?.horario_apertura && restauranteActual?.horario_cierre), cta: { label: "Configurar", to: "/dashboard/horarios" } },
    { id: "portada", label: "Sube una foto de portada", done: !!restauranteActual?.imagen, cta: { label: "Subir portada", to: "/dashboard/media" } },
    { id: "reserva", label: "Recibe tu primera reserva", done: (analytics?.reservas_hoy ?? 0) > 0 || (analytics?.total_reservas_periodo ?? 0) > 0, cta: { label: "Compartir restaurante", to: `/restaurantes/${restauranteActual?.id}` } },
  ].filter((s) => !s.done);

  const showChecklist = !checklistDismissed && pendingSetupSteps.length > 0 && !analyticsLoading && !!selectedRestauranteId;

  const reservasHoy = analytics?.reservas_hoy ?? 0;
  const personasHoy = Math.round((analytics?.personas_promedio ?? 0) * reservasHoy);
  const estadoOp = reservasHoy >= 8 ? { label: "Ocupado", color: "bg-rose-500" }
    : reservasHoy >= 3 ? { label: "Moderado", color: "bg-amber-500" }
    : { label: "Tranquilo", color: "bg-emerald-500" };

  const quickActions = [
    { icon: CalendarDays, label: "Nueva reserva", desc: "Registrar cliente", onClick: () => navigate("/dashboard/reservas") },
    { icon: Table2, label: "Gestionar mesas", desc: "Capacidad y estado", onClick: () => navigate("/dashboard/mesas") },
    { icon: Clock, label: "Horarios", desc: "Apertura y cierre", onClick: () => navigate("/dashboard/horarios") },
    { icon: ImageIcon, label: "Medios", desc: "Fotos y branding", onClick: () => navigate("/dashboard/media") },
    { icon: BarChart3, label: "Analytics", desc: "Métricas detalladas", onClick: () => navigate("/dashboard/analytics") },
    { icon: Settings, label: "Configuración", desc: "Datos del restaurante", onClick: () => navigate("/dashboard/restaurantes") },
  ];

  if (isLoadingInitial) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-card border border-border/40 p-4 animate-pulse">
              <div className="h-3 w-16 bg-muted rounded mb-3" />
              <div className="h-7 w-12 bg-muted rounded mb-1" />
              <div className="h-3 w-20 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!selectedRestauranteId) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <AlertCircle className="h-7 w-7 text-muted-foreground/60" />
        </div>
        <h2 className="font-display text-xl font-semibold mb-1">Sin restaurante asociado</h2>
        <p className="text-sm text-muted-foreground max-w-sm">No tienes un restaurante vinculado a tu cuenta. Contacta al administrador.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{restauranteActual?.nombre}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="h-9 shadow-sm" onClick={() => navigate("/dashboard/reservas")}>
            <Plus className="h-4 w-4 mr-1.5" /> Nueva reserva
          </Button>
          <Button variant="outline" size="sm" className="h-9" asChild>
            <Link to="/dashboard/calendario"><CalendarDays className="h-4 w-4 mr-1.5" /> Calendario</Link>
          </Button>
        </div>
      </div>

      {/* Checklist */}
      {showChecklist && (
        <div className="rounded-xl border border-primary/10 bg-primary/[0.03] p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Configuración pendiente
            </h2>
            <button onClick={() => { setChecklistDismissed(true); localStorage.setItem(checklistDismissedKey, "true"); }} className="p-1 rounded-md text-muted-foreground/50 hover:text-muted-foreground transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="space-y-1.5">
            {pendingSetupSteps.map((step) => (
              <div key={step.id} className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-primary/[0.02] transition-colors">
                <div className="h-5 w-5 rounded-full border-2 border-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-primary/60">{step.id === "mesas" ? "1" : step.id === "horarios" ? "2" : step.id === "portada" ? "3" : "4"}</span>
                </div>
                <span className="text-sm text-muted-foreground flex-1">{step.label}</span>
                <Link to={step.cta.to} className="text-xs font-medium text-primary hover:text-primary/80 transition-colors whitespace-nowrap">{step.cta.label}</Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insight Cards */}
      {analyticsLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-card border border-border/40 p-4 animate-pulse">
              <div className="h-3 w-16 bg-muted rounded mb-3" />
              <div className="h-7 w-12 bg-muted rounded mb-1" />
              <div className="h-3 w-20 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : analyticsError ? (
        <div className="rounded-xl border border-border/40 bg-card p-8 text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive/50" />
          <p className="text-sm text-muted-foreground mb-3">Error al cargar métricas</p>
          <Button variant="outline" size="sm">Reintentar</Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statCard(CalendarDays, "Reservas hoy", reservasHoy, `${analytics?.confirmadas ?? 0} confirmadas`, "bg-primary")}
          {statCard(Users, "Personas hoy", personasHoy, `${analytics?.personas_promedio ?? 0} por mesa`, "bg-violet-500")}
          {statCard(Table2, "Mesas ocupadas", `${analytics?.mesas_ocupadas_hoy ?? 0}/${analytics?.mesas_totales ?? 0}`, `${analytics?.mesas_libres_hoy ?? 0} libres`, "bg-emerald-500")}
          {statCard(Clock, "Estado", estadoOp.label, `${reservasHoy} reserva${reservasHoy !== 1 ? "s" : ""} hoy`, estadoOp.color)}
        </div>
      )}

      {/* Timeline */}
      <div className="rounded-xl bg-card border border-border/40 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/20">
          <h2 className="font-display text-base font-semibold flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 relative">
              <span className="animate-ping absolute inset-0 rounded-full bg-emerald-500/50" />
            </span>
            Próximas reservas
            <span className="text-xs font-normal text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">{proximasReservas.length} hoy</span>
          </h2>
          <Button variant="ghost" size="sm" className="text-xs gap-1" asChild>
            <Link to="/dashboard/reservas">Ver todas <ChevronRight className="h-3 w-3" /></Link>
          </Button>
        </div>

        {reservasLoading ? (
          <div className="p-5 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-4 animate-pulse">
                <div className="h-10 w-10 rounded-xl bg-muted flex-shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 w-36 bg-muted rounded" />
                  <div className="h-3 w-24 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : proximasReservas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
            <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
              <CalendarDays className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <h3 className="font-display text-base font-semibold mb-1">Sin reservas hoy</h3>
            <p className="text-sm text-muted-foreground max-w-xs mb-4">No hay reservas programadas para hoy. Cuando recibas reservas, aparecerán aquí.</p>
            <Button size="sm" onClick={() => navigate("/dashboard/reservas")}><Plus className="h-4 w-4 mr-1.5" /> Crear reserva</Button>
          </div>
        ) : (
          <div className="p-5">
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-px bg-border/30" />
              <div className="space-y-4">
                {proximasReservas.map((r: Reserva) => (
                  <div key={r.id} className="relative flex items-start gap-4">
                    <div className="relative z-10 flex flex-col items-center pt-0.5">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border ${r.estado === "confirmada" ? "bg-primary/10 border-primary/20 text-primary" : "bg-muted/30 border-border/30 text-muted-foreground/60"}`}>
                        <Clock className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 py-1.5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{r.cliente?.name || `Cliente #${r.cliente_id}`}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-medium text-primary">{r.hora?.substring(0, 5)}</span>
                            <span className="text-xs text-muted-foreground/50">·</span>
                            <span className="text-xs text-muted-foreground">{r.cantidad_personas} pers.</span>
                            {r.mesa && (
                              <>
                                <span className="text-xs text-muted-foreground/50">·</span>
                                <span className="text-xs text-muted-foreground">Mesa {r.mesa.numero}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <StatusBadge estado={r.estado} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Secondary section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Horas pico */}
        <div className="lg:col-span-2 rounded-xl bg-card border border-border/40 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" /> Horas pico
            </h2>
            <Link to="/dashboard/analytics" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-0.5">
              Analytics <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          {analytics?.horas_pico && analytics.horas_pico.length > 0 ? (
            <div className="space-y-2">
              {analytics.horas_pico.slice(0, 5).map((h: { hora: number; total: number }, idx: number) => {
                const maxTotal = Math.max(...analytics.horas_pico.map((x: { total: number }) => x.total));
                const width = maxTotal > 0 ? (h.total / maxTotal) * 100 : 0;
                return (
                  <div key={h.hora} className="flex items-center gap-3">
                    <span className="text-xs font-medium w-10 text-right text-muted-foreground/70">{String(h.hora).padStart(2, "0")}:00</span>
                    <div className="flex-1 h-2.5 bg-muted/40 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${width}%`, background: `linear-gradient(90deg, hsl(142 70% 45%), hsl(142 70% 35%))` }} />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground w-5 text-right">{h.total}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground/60 text-center py-8">Datos disponibles cuando tengas reservas.</p>
          )}
        </div>

        {/* Quick actions */}
        <div className="lg:col-span-3 rounded-xl bg-card border border-border/40 shadow-sm p-5">
          <h2 className="font-display text-sm font-semibold mb-4 flex items-center gap-2">
            <UtensilsCrossed className="h-4 w-4 text-muted-foreground" /> Acciones rápidas
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map((a) => (
              <button key={a.label} onClick={a.onClick}
                className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-border/30 bg-card/50 hover:bg-muted/30 hover:border-border/50 transition-all duration-200 active:scale-[0.98]">
                <div className="h-9 w-9 rounded-xl bg-muted/50 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                  <a.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{a.label}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">{a.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
