import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { restauranteService, type Reserva } from "@/services/restauranteService";
import MainLayout from "@/layouts/MainLayout";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import { formatDate } from "@/lib/date";
import {
  CalendarDays, Clock, Users, MapPin, AlertCircle, ArrowLeft,
  CheckCircle2, XCircle, AlertTriangle, Hourglass, ChevronRight,
} from "lucide-react";
import { handleApiError } from "@/services/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type FilterType = "todas" | "pendiente" | "confirmada" | "completada" | "cancelada" | "no_show";

const filterTabs: { key: FilterType; label: string; icon: React.ElementType; color: string }[] = [
  { key: "todas", label: "Todas", icon: CalendarDays, color: "" },
  { key: "pendiente", label: "Pendientes", icon: Hourglass, color: "text-warning" },
  { key: "confirmada", label: "Confirmadas", icon: CheckCircle2, color: "text-success" },
  { key: "cancelada", label: "Canceladas", icon: XCircle, color: "text-destructive" },
  { key: "completada", label: "Completadas", icon: AlertTriangle, color: "text-muted-foreground" },
];

const estadoConfig: Record<string, { badge: string; label: string; icon: React.ElementType; iconColor: string }> = {
  pendiente: {
    badge: "bg-warning/10 text-warning border-warning/20",
    label: "Pendiente",
    icon: Hourglass,
    iconColor: "text-warning",
  },
  confirmada: {
    badge: "bg-success/10 text-success border-success/20",
    label: "Confirmada",
    icon: CheckCircle2,
    iconColor: "text-success",
  },
  completada: {
    badge: "bg-muted/50 text-muted-foreground border-border",
    label: "Completada",
    icon: AlertTriangle,
    iconColor: "text-muted-foreground",
  },
  cancelada: {
    badge: "bg-destructive/10 text-destructive border-destructive/20",
    label: "Cancelada",
    icon: XCircle,
    iconColor: "text-destructive",
  },
  no_show: {
    badge: "bg-gray-100 text-gray-500 border-gray-300",
    label: "No Show",
    icon: AlertCircle,
    iconColor: "text-muted-foreground",
  },
};

const SkeletonReserva = () => (
  <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-soft animate-pulse">
    <div className="flex items-start justify-between">
      <div className="space-y-3 flex-1">
        <div className="h-5 w-48 bg-muted rounded" />
        <div className="flex gap-4">
          <div className="h-4 w-28 bg-muted rounded" />
          <div className="h-4 w-20 bg-muted rounded" />
          <div className="h-4 w-24 bg-muted rounded" />
        </div>
      </div>
      <div className="h-8 w-24 bg-muted rounded-full" />
    </div>
  </div>
);

const MisReservas = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>("todas");
  const [cancelingId, setCancelingId] = useState<number | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useSEO({
    title: "TableBit - Mis reservas",
    description: "Consulta y gestiona todas tus reservas de restaurantes.",
  });

  const { data: reservas = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ['mis-reservas', user?.id],
    queryFn: async () => {
      const res = await restauranteService.misReservas();
      return res.data;
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => restauranteService.cancelarReserva(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mis-reservas', user?.id] });
    },
    onError: (err) => {
      const apiError = handleApiError(err);
      toast({ variant: "destructive", title: "Error", description: apiError.message });
    },
  });

  const errorMessage = error ? (error as any)?.response?.data?.message || "Error al cargar reservas" : null;

  const filteredReservas = useMemo(
    () =>
      activeFilter === "todas"
        ? reservas
        : reservas.filter((r: Reserva) => r.estado === activeFilter),
    [reservas, activeFilter]
  );

  const filterCounts = useMemo(() => {
    const counts: Record<string, number> = { todas: reservas.length };
    reservas.forEach((r: Reserva) => {
      counts[r.estado] = (counts[r.estado] || 0) + 1;
    });
    return counts;
  }, [reservas]);

  const cancelar = async () => {
    if (!cancelingId) return;
    setShowCancelDialog(false);
    try {
      await cancelMutation.mutateAsync(cancelingId);
      toast({
        title: "Reserva cancelada",
        description: "Tu reserva ha sido cancelada exitosamente.",
      });
    } catch {
      // Error handled in mutation.onError
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <MainLayout>
      <div className="container py-6 sm:py-8 lg:py-12 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Volver
          </button>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <CalendarDays className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold">Mis Reservas</h1>
              <p className="text-sm text-muted-foreground">
                {reservas.length} reserva{reservas.length !== 1 ? "s" : ""} en total
              </p>
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        {!loading && !errorMessage && reservas.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-1 px-1 scrollbar-hide">
            {filterTabs
              .filter((tab) => tab.key === "todas" || (filterCounts[tab.key] || 0) > 0)
              .map((tab) => {
                const Icon = tab.icon;
                const isActive = activeFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveFilter(tab.key)}
                    className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted border border-border"
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${isActive ? "" : tab.color}`} />
                    {tab.label}
                    <span
                      className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? "bg-primary-foreground/20"
                          : "bg-muted"
                      }`}
                    >
                      {filterCounts[tab.key] || 0}
                    </span>
                  </button>
                );
              })}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonReserva key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && errorMessage && (
          <div className="text-center py-12 sm:py-16 rounded-2xl border border-border bg-card">
            <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-destructive/40" />
            <p className="text-sm sm:text-base text-muted-foreground mb-4">{errorMessage}</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Reintentar
            </Button>
          </div>
        )}

        {/* Empty */}
        {!loading && !errorMessage && reservas.length === 0 && (
          <div className="text-center py-12 sm:py-16 rounded-2xl border border-dashed border-border bg-card/50">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-4">
              <CalendarDays className="h-8 w-8 sm:h-10 sm:w-10 text-primary/30" />
            </div>
            <h3 className="font-display text-lg sm:text-xl font-semibold mb-2">No tienes reservas aún</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Explora los mejores restaurantes y reserva tu mesa en segundos.
            </p>
            <Button onClick={() => navigate("/")} className="rounded-full">
              Explorar restaurantes
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}

        {/* No results for filter */}
        {!loading && !errorMessage && reservas.length > 0 && filteredReservas.length === 0 && (
          <div className="text-center py-12 sm:py-16">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <CalendarDays className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground/30" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">
              No hay reservas {estadoConfig[activeFilter]?.label.toLowerCase() || ""}
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setActiveFilter("todas")}>
              Ver todas las reservas
            </Button>
          </div>
        )}

        {/* Reservas list */}
        {!loading && !errorMessage && filteredReservas.length > 0 && (
          <div className="space-y-3 sm:space-y-4">
            {filteredReservas.map((r) => {
              const config = estadoConfig[r.estado] || estadoConfig.pendiente;
              const StatusIcon = config.icon;

              return (
                <div
                  key={r.id}
                  className="group rounded-2xl border border-border bg-card shadow-soft hover:shadow-elevated transition-all duration-300 animate-fade-in overflow-hidden"
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      {/* Left info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 flex-wrap">
                          <h3 className="font-display text-base sm:text-lg font-semibold truncate">
                            {r.restaurante?.nombre || `Restaurante #${r.restaurante_id}`}
                          </h3>
                          <Badge className={`border ${config.badge} text-xs font-medium`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarDays className="h-4 w-4 flex-shrink-0 text-primary/60" />
                            <span className="capitalize">{formatDate(r.fecha, "long")}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 flex-shrink-0 text-primary/60" />
                            <span>{r.hora} hs</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4 flex-shrink-0 text-primary/60" />
                            <span>{r.cantidad_personas} persona{r.cantidad_personas !== 1 ? "s" : ""}</span>
                          </div>
                          {r.restaurante?.direccion && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4 flex-shrink-0 text-primary/60" />
                              <span className="truncate">{r.restaurante.direccion}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0 flex flex-col gap-2">
                        {["pendiente", "confirmada"].includes(r.estado) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCancelingId(r.id);
                              setShowCancelDialog(true);
                            }}
                            className="text-destructive border-destructive/20 hover:bg-destructive/5 text-xs sm:text-sm h-8 sm:h-9"
                          >
                            Cancelar
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/restaurantes/${r.restaurante_id}`)}
                          className="text-xs sm:text-sm h-8 sm:h-9"
                        >
                          Ver
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Status bar */}
                  <div
                    className={`h-1 ${
                      r.estado === "confirmada"
                        ? "bg-success"
                        : r.estado === "pendiente"
                        ? "bg-warning"
                        : r.estado === "cancelada"
                        ? "bg-destructive"
                        : "bg-muted"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              ¿Cancelar reserva?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La reserva será marcada como cancelada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction
              onClick={cancelar}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sí, cancelar reserva
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default MisReservas;
