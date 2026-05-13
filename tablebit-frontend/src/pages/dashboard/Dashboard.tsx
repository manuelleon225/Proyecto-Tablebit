import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/layouts/DashboardLayout";
import { restauranteService, type Reserva } from "@/services/restauranteService";
import { CalendarDays, Users, UtensilsCrossed, TrendingUp, AlertCircle, Clock, XCircle, CheckCircle2, Ban, Percent } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import { ESTADO_CONFIG } from "@/constants/estados";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Dashboard = () => {
  const { user } = useAuth();
  const [selectedRestauranteId, setSelectedRestauranteId] = useState<number | null>(null);

  useSEO({
    title: "TableBit - Dashboard",
    description: "Panel de administración de TableBit. Gestiona tus restaurantes y reservas.",
  });

  // Query 1: restaurants the user manages
  const { data: misRestaurantesRespuesta } = useQuery({
    queryKey: ['mis-restaurantes'],
    queryFn: async () => {
      const res = await restauranteService.getMisRestaurantes();
      return res.data;
    },
    enabled: !!user && !user.restaurante,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const misRestaurantes = user?.restaurante
    ? [{ id: user.restaurante.id, nombre: user.restaurante.nombre }]
    : (misRestaurantesRespuesta || []);

  // Sync selectedRestauranteId when restaurant list loads or user changes
  useEffect(() => {
    if (!selectedRestauranteId && misRestaurantes.length > 0) {
      setSelectedRestauranteId(misRestaurantes[0].id);
    }
  }, [misRestaurantes, user?.id]);

  // Fallback when user has user.restaurante (admin_restaurante)
  useEffect(() => {
    if (user?.restaurante && !selectedRestauranteId) {
      setSelectedRestauranteId(user.restaurante.id);
    }
  }, [user]);

  // Query 2: analytics data
  const {
    data: analytics,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useQuery({
    queryKey: ['dashboard-analytics', selectedRestauranteId],
    queryFn: async () => {
      const res = await restauranteService.getDashboard(selectedRestauranteId!);
      return res.data;
    },
    enabled: !!selectedRestauranteId,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Query 3: today's reservations
  const {
    data: proximasReservas = [],
    isLoading: reservasLoading,
    error: reservasError,
  } = useQuery({
    queryKey: ['dashboard-proximas-reservas', selectedRestauranteId],
    queryFn: async () => {
      const res = await restauranteService.getReservas({
        restaurante_id: selectedRestauranteId!,
        fecha: new Date().toISOString().split("T")[0],
        per_page: 10,
      });
      const data = res.data;
      const reservasArray = Array.isArray(data) ? data : (data.data || []);
      return reservasArray
        .filter((r: Reserva) => ["pendiente", "confirmada"].includes(r.estado))
        .slice(0, 5);
    },
    enabled: !!selectedRestauranteId,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const handleRestauranteChange = (id: string) => {
    setSelectedRestauranteId(Number(id));
  };

  const isLoadingInitial = !selectedRestauranteId && misRestaurantes.length === 0;

  const restauranteActual = misRestaurantes.find((r: { id: number }) => r.id === selectedRestauranteId);
  const analyticsErrorMessage = analyticsError
    ? "Error al cargar métricas del dashboard"
    : null;
  const reservasErrorMessage = reservasError
    ? "Error al cargar reservas de hoy"
    : null;

  const statCards = [
    {
      label: "Reservas hoy",
      value: analytics?.reservas_hoy ?? 0,
      icon: CalendarDays,
      subtext: `${analytics?.confirmadas ?? 0} confirmadas`,
      accent: "text-primary",
      bgIcon: "bg-primary/10",
    },
    {
      label: "Ocupación",
      value: `${analytics?.ocupacion_hoy ?? 0}%`,
      icon: Percent,
      subtext: `${analytics?.mesas_ocupadas_hoy ?? 0}/${analytics?.mesas_totales ?? 0} mesas`,
      accent: "text-success",
      bgIcon: "bg-success/10",
    },
    {
      label: "Personas promedio",
      value: analytics?.personas_promedio ?? 0,
      icon: Users,
      subtext: "Por reserva",
      accent: "text-secondary",
      bgIcon: "bg-secondary/10",
    },
    {
      label: "Cancelaciones",
      value: `${analytics?.canceladas ?? 0}`,
      icon: XCircle,
      subtext: `${analytics?.no_shows ?? 0} no-shows · ${analytics?.tasa_cancelacion ?? 0}% tasa`,
      accent: analytics && (analytics.tasa_cancelacion > 20) ? "text-destructive" : "text-muted-foreground",
      bgIcon: analytics && (analytics.tasa_cancelacion > 20) ? "bg-destructive/10" : "bg-muted/50",
    },
  ];

  return (
    <DashboardLayout>
      <div>
        {/* Header always visible */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {restauranteActual?.nombre || (isLoadingInitial ? "Cargando..." : "Tu restaurante")}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            {misRestaurantes.length > 1 && (
              <Select value={String(selectedRestauranteId)} onValueChange={handleRestauranteChange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {misRestaurantes.map((r: { id: number; nombre: string }) => (
                    <SelectItem key={r.id} value={String(r.id)}>{r.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard/calendario">
                <CalendarDays className="h-4 w-4 mr-1.5" />
                Calendario
              </Link>
            </Button>
          </div>
        </div>

        {/* No restaurant state */}
        {isLoadingInitial ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-5 animate-pulse">
                <div className="h-4 w-24 bg-muted rounded mb-3" />
                <div className="h-8 w-16 bg-muted rounded mb-2" />
                <div className="h-3 w-20 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : !selectedRestauranteId ? (
          <div className="text-center py-16 rounded-xl border border-border bg-card max-w-lg mx-auto">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-warning" />
            <h3 className="font-display text-lg font-semibold mb-2">Sin restaurante asociado</h3>
            <p className="text-sm text-muted-foreground mb-6">
              No tienes un restaurante vinculado a tu cuenta. Contacta al administrador.
            </p>
          </div>
        ) : (
          <>
            {/* Stats cards with per-card loading */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
              {analyticsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-border bg-card p-5 animate-pulse">
                    <div className="h-4 w-24 bg-muted rounded mb-3" />
                    <div className="h-8 w-16 bg-muted rounded mb-2" />
                    <div className="h-3 w-20 bg-muted rounded" />
                  </div>
                ))
              ) : analyticsErrorMessage ? (
                <div className="col-span-full rounded-xl border border-border bg-card p-6 text-center">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive/50" />
                  <p className="text-sm text-muted-foreground">{analyticsErrorMessage}</p>
                </div>
              ) : (
                statCards.map((s, i) => (
                  <div
                    key={s.label}
                    className="rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in overflow-hidden"
                    style={{ animationDelay: `${i * 75}ms` }}
                  >
                    <div className={`h-1 ${s.bgIcon.replace('bg-', 'bg-').replace('/10', '') || 'bg-primary'}`} />
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-muted-foreground">{s.label}</span>
                        <div className={`h-9 w-9 rounded-lg ${s.bgIcon} flex items-center justify-center`}>
                          <s.icon className={`h-4 w-4 ${s.accent}`} />
                        </div>
                      </div>
                      <p className="font-display text-2xl font-bold">{s.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{s.subtext}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Horas pico & Métricas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  Horas pico
                </h2>
                    {analytics?.horas_pico && analytics.horas_pico.length > 0 ? (
                      <div className="space-y-2">
                        {analytics.horas_pico.map((h: { hora: number; total: number }, idx: number) => {
                          const maxTotal = Math.max(...analytics.horas_pico.map((x: { total: number }) => x.total));
                          const width = maxTotal > 0 ? (h.total / maxTotal) * 100 : 0;
                          const intensity = 60 + (idx * 8);
                          return (
                            <div key={h.hora} className="flex items-center gap-3">
                              <span className="text-xs font-medium w-10 text-right text-muted-foreground">
                                {String(h.hora).padStart(2, "0")}:00
                              </span>
                              <div className="flex-1 h-5 bg-muted/30 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{ width: `${width}%`, background: `linear-gradient(90deg, hsl(142, 76%, ${intensity}%), hsl(142, 70%, ${intensity - 15}%))` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-muted-foreground w-6 text-right">{h.total}</span>
                            </div>
                          );
                        })}
                      </div>
                ) : analyticsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-6 bg-muted/50 rounded-full animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">Sin datos aún</p>
                )}
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  Métricas del período
                </h2>
                {analyticsErrorMessage ? (
                  <p className="text-sm text-destructive text-center py-4">{analyticsErrorMessage}</p>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-success/5 border border-success/10">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span className="text-sm text-muted-foreground">Completadas</span>
                      </div>
                      <p className="text-xl font-bold text-success">{analytics?.completadas ?? 0}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/10">
                      <div className="flex items-center gap-2 mb-1">
                        <XCircle className="h-4 w-4 text-destructive" />
                        <span className="text-sm text-muted-foreground">Canceladas</span>
                      </div>
                      <p className="text-xl font-bold text-destructive">{analytics?.canceladas ?? 0}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 border border-border">
                      <div className="flex items-center gap-2 mb-1">
                        <Ban className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">No-shows</span>
                      </div>
                      <p className="text-xl font-bold">{analytics?.no_shows ?? 0}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                      <div className="flex items-center gap-2 mb-1">
                        <UtensilsCrossed className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">Total período</span>
                      </div>
                      <p className="text-xl font-bold text-primary">{analytics?.total_reservas_periodo ?? 0}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reservas de hoy */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-semibold">Reservas de hoy</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/dashboard/reservas">Ver todas</Link>
                </Button>
              </div>
              {reservasLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 py-3 px-4 animate-pulse">
                      <div className="h-10 w-10 rounded-lg bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 bg-muted rounded" />
                        <div className="h-3 w-48 bg-muted rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : reservasErrorMessage ? (
                <p className="text-sm text-destructive text-center py-8">{reservasErrorMessage}</p>
              ) : proximasReservas.length === 0 ? (
                <div className="text-center py-10">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground">No hay reservas para hoy</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {proximasReservas.map((r: Reserva) => {
                    const isPast = r.hora && r.hora.substring(0, 5) < new Date().toTimeString().substring(0, 5);
                    return (
                      <div
                        key={r.id}
                        className="flex items-center justify-between py-3 px-4 rounded-xl bg-card border border-border/50 hover:border-border hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`relative h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isPast ? 'bg-muted/30' : 'bg-primary/10'}`}>
                            <Clock className={`h-4 w-4 ${isPast ? 'text-muted-foreground/50' : 'text-primary'}`} />
                            {!isPast && <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success animate-pulse" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {r.cliente?.name || `Cliente #${r.cliente_id}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {r.hora?.substring(0, 5)} · {r.cantidad_personas} persona{r.cantidad_personas !== 1 ? "s" : ""}
                              {r.mesa && ` · Mesa ${r.mesa.numero}`}
                            </p>
                          </div>
                        </div>
                        <Badge className={`${ESTADO_CONFIG[r.estado]?.bg} ${ESTADO_CONFIG[r.estado]?.color}`}>
                          {ESTADO_CONFIG[r.estado]?.label}
                        </Badge>
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
