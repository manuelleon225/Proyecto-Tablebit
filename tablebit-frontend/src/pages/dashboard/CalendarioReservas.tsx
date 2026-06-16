import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { restauranteService } from "@/services/restauranteService";
import type { CalendarioEvento, ReservaEstado } from "@/types/restaurante";
import { ChevronLeft, ChevronRight, AlertCircle, Clock, Users, Mail, User, Phone, X, CalendarDays, Check, Eye, Loader2 } from "lucide-react";
import { useRestaurante } from "@/context/RestauranteContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSEO } from "@/hooks/useSEO";
import { useToast } from "@/hooks/use-toast";
import { handleApiError } from "@/services/api";
import { ESTADO_CONFIG } from "@/constants/estados";
import { CalendarDaySkeleton } from "@/components/skeletons/CalendarDaySkeleton";
import { VirtualList } from "@/components/ui/VirtualList";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


const dias = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const CalendarioReservas = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [detailEvento, setDetailEvento] = useState<CalendarioEvento | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const { selectedRestauranteId, setSelectedRestauranteId, misRestaurantes } = useRestaurante();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const refetchCalendario = useCallback(() => {
    if (selectedRestauranteId && currentDate) {
      queryClient.invalidateQueries({ queryKey: ['calendario', selectedRestauranteId, currentDate.getFullYear(), currentDate.getMonth()] });
    }
  }, [queryClient, selectedRestauranteId, currentDate]);

  const estadoMutation = useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: ReservaEstado }) =>
      restauranteService.cambiarEstadoReserva(id, estado),
    onSuccess: () => {
      refetchCalendario();
      toast({ title: "Estado actualizado" });
    },
    onError: (err) => {
      toast({ variant: "destructive", title: "Error", description: handleApiError(err).message });
    },
  });

  const cancelarMutation = useMutation({
    mutationFn: (id: number) => restauranteService.cancelarReserva(id),
    onSuccess: () => {
      refetchCalendario();
      toast({ title: "Reserva cancelada" });
    },
    onError: (err) => {
      toast({ variant: "destructive", title: "Error", description: handleApiError(err).message });
    },
  });

  const isProcessing = (id: number) =>
    estadoMutation.isPending && estadoMutation.variables?.id === id
    || cancelarMutation.isPending && cancelarMutation.variables === id;

  useSEO({
    title: "TableBit - Calendario de reservas",
    description: "Visualiza y gestiona las reservas en el calendario de tu restaurante.",
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;

  const localDateStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const startOfMonth = localDateStr(new Date(year, month, 1));
  const endOfMonth = localDateStr(new Date(year, month + 1, 0));

  const restauranteId = selectedRestauranteId;

  const { data: response, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['calendario', restauranteId, year, month],
    queryFn: async () => {
      const res = await restauranteService.getCalendario(restauranteId!, startOfMonth, endOfMonth);
      return res.data;
    },
    enabled: !!restauranteId,
    staleTime: 2 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  const eventos = response?.eventos || [];

  const eventosPorDia = useMemo(() => {
    const map: Record<number, CalendarioEvento[]> = {};
    eventos.forEach((ev: CalendarioEvento) => {
      const dia = new Date(ev.start).getDate();
      if (!map[dia]) map[dia] = [];
      map[dia].push(ev);
    });
    return map;
  }, [eventos]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const errorMessage = error
    ? (error as any)?.response?.data?.message || "Error al cargar el calendario"
    : null;

  return (
    <>
    <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold">Calendario</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {monthNames[month]} {year}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {misRestaurantes.length > 1 && (
              <Select value={String(selectedRestauranteId)} onValueChange={(v) => setSelectedRestauranteId(Number(v))}>
                <SelectTrigger className="w-40 sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {misRestaurantes.map((r: { id: number; nombre: string }) => (
                    <SelectItem key={r.id} value={String(r.id)}>{r.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                Hoy
              </Button>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <CalendarDaySkeleton />
        ) : errorMessage ? (
          <div className="text-center py-16 rounded-xl border border-border bg-card">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive/50" />
            <p className="text-muted-foreground mb-4">{errorMessage}</p>
            <Button variant="outline" onClick={() => refetch()}>Reintentar</Button>
          </div>
        ) : !restauranteId ? (
          <div className="text-center py-16 rounded-xl border border-border bg-card">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">No tienes un restaurante asociado.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="grid grid-cols-7 border-b border-border">
              {dias.map((d) => (
                <div key={d} className="p-2 sm:p-3 text-center text-xs sm:text-sm font-medium text-muted-foreground bg-muted/30">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square p-1 sm:p-2 border-b border-r border-border bg-muted/10" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dia = i + 1;
                const eventosDelDia = eventosPorDia[dia] || [];
                const today = new Date();
                const isToday = dia === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                return (
                  <div
                    key={dia}
                    onClick={() => { setSelectedDay(dia); setShowDialog(true); }}
                    className={`aspect-square p-1 sm:p-2 border-b border-r border-border transition-colors cursor-pointer ${
                      eventosDelDia.length > 0 ? "hover:bg-primary/5" : "hover:bg-muted/20"
                    } ${isToday ? "bg-primary/5" : ""}`}
                  >
                    <div className={`h-6 w-6 sm:h-7 sm:w-7 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                      isToday ? "bg-primary text-primary-foreground" : "text-foreground"
                    }`}>
                      {dia}
                    </div>
                    <div className="mt-0.5 sm:mt-1 space-y-0.5">
                      {eventosDelDia.slice(0, 3).map((ev) => {
                        const cfg = ESTADO_CONFIG[ev.extendedProps?.estado] || ESTADO_CONFIG.confirmada;
                        return (
                          <button
                            key={ev.id}
                            onClick={(e) => { e.stopPropagation(); setSelectedDay(dia); setShowDialog(true); }}
                            className={`w-full text-left text-[10px] sm:text-xs leading-tight px-1 py-0.5 rounded truncate ${cfg.bg} ${cfg.color} hover:opacity-80 transition-opacity`}
                          >
                            {ev.title?.split(" ")[0]}
                          </button>
                        );
                      })}
                      {eventosDelDia.length > 3 && (
                        <p className="text-[10px] text-muted-foreground px-1">+{eventosDelDia.length - 3} más</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              {selectedDay ? new Date(year, month, selectedDay).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : ""}
            </DialogTitle>
          </DialogHeader>
          {selectedDay && (() => {
            const dayEventos = eventosPorDia[selectedDay] || [];
            const dayEventosSorted = [...dayEventos].sort((a, b) => a.start.localeCompare(b.start));
            return (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">{dayEventos.length} reserva{dayEventos.length !== 1 ? "s" : ""} para este día</p>
                {dayEventos.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarDays className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No hay reservas para este día</p>
                  </div>
                ) : dayEventos.length > 25 ? (
                  <VirtualList
                    items={dayEventosSorted}
                    itemHeight={120}
                    overscan={3}
                    renderItem={(ev: CalendarioEvento) => {
                      const p = ev.extendedProps;
                      const estado = p?.estado as ReservaEstado;
                      const cfg = ESTADO_CONFIG[estado] || ESTADO_CONFIG.confirmada;
                      const loading = isProcessing(ev.id);
                      return (
                        <div key={ev.id} className="rounded-lg border border-border bg-card p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5 text-muted-foreground" />
                              {ev.title}
                            </span>
                            <Badge className={`${cfg.bg} ${cfg.color} border text-[10px]`}>{cfg.label}</Badge>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(ev.start).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                              {p?.duracion && ` (${p.duracion} min)`}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {p?.personas} {p?.personas === 1 ? "persona" : "personas"}
                            </span>
                            {p?.mesa && (
                              <span className="flex items-center gap-1">
                                <X className="h-3 w-3" />
                                {p.mesa}
                              </span>
                            )}
                            {p?.cliente_email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {p.cliente_email}
                              </span>
                            )}
                            {p?.cliente_telefono && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {p.cliente_telefono}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 pt-1.5 border-t border-border/30">
                            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 px-2" onClick={() => { setDetailEvento(ev); setShowDetailDialog(true); }}>
                              <Eye className="h-3 w-3" /> Ver
                            </Button>
                            {estado === 'pendiente' && (
                              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 px-2 text-success hover:text-success" disabled={loading} onClick={() => estadoMutation.mutate({ id: ev.id, estado: 'confirmada' })}>
                                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Confirmar
                              </Button>
                            )}
                            {estado === 'confirmada' && (
                              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 px-2 text-success hover:text-success" disabled={loading} onClick={() => estadoMutation.mutate({ id: ev.id, estado: 'completada' })}>
                                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Completar
                              </Button>
                            )}
                            {(estado === 'pendiente' || estado === 'confirmada') && (
                              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 px-2 text-destructive hover:text-destructive ml-auto" disabled={loading} onClick={() => cancelarMutation.mutate(ev.id)}>
                                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />} Cancelar
                              </Button>
                            )}
                          </div>
                          {p?.notas && (
                            <p className="text-xs text-muted-foreground italic border-t border-border/30 pt-1 mt-1">{p.notas}</p>
                          )}
                        </div>
                      );
                    }}
                    className="max-h-80 pr-1"
                  />
                ) : (
                  <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                    {dayEventosSorted.map((ev) => {
                      const p = ev.extendedProps;
                      const estado = p?.estado as ReservaEstado;
                      const cfg = ESTADO_CONFIG[estado] || ESTADO_CONFIG.confirmada;
                      const loading = isProcessing(ev.id);
                      return (
                        <div key={ev.id} className="rounded-lg border border-border bg-card p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5 text-muted-foreground" />
                              {ev.title}
                            </span>
                            <Badge className={`${cfg.bg} ${cfg.color} border text-[10px]`}>{cfg.label}</Badge>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(ev.start).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                              {p?.duracion && ` (${p.duracion} min)`}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {p?.personas} {p?.personas === 1 ? "persona" : "personas"}
                            </span>
                            {p?.mesa && (
                              <span className="flex items-center gap-1">
                                <X className="h-3 w-3" />
                                {p.mesa}
                              </span>
                            )}
                            {p?.cliente_email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {p.cliente_email}
                              </span>
                            )}
                            {p?.cliente_telefono && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {p.cliente_telefono}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 pt-1.5 border-t border-border/30">
                            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 px-2" onClick={() => { setDetailEvento(ev); setShowDetailDialog(true); }}>
                              <Eye className="h-3 w-3" /> Ver
                            </Button>
                            {estado === 'pendiente' && (
                              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 px-2 text-success hover:text-success" disabled={loading} onClick={() => estadoMutation.mutate({ id: ev.id, estado: 'confirmada' })}>
                                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Confirmar
                              </Button>
                            )}
                            {estado === 'confirmada' && (
                              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 px-2 text-success hover:text-success" disabled={loading} onClick={() => estadoMutation.mutate({ id: ev.id, estado: 'completada' })}>
                                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Completar
                              </Button>
                            )}
                            {(estado === 'pendiente' || estado === 'confirmada') && (
                              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 px-2 text-destructive hover:text-destructive ml-auto" disabled={loading} onClick={() => cancelarMutation.mutate(ev.id)}>
                                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />} Cancelar
                              </Button>
                            )}
                          </div>
                          {p?.notas && (
                            <p className="text-xs text-muted-foreground italic border-t border-border/30 pt-1 mt-1">{p.notas}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              {detailEvento?.title || "Detalle de reserva"}
            </DialogTitle>
          </DialogHeader>
          {detailEvento && (() => {
            const p = detailEvento.extendedProps;
            const cfg = ESTADO_CONFIG[p?.estado as ReservaEstado] || ESTADO_CONFIG.confirmada;
            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className={`${cfg.bg} ${cfg.color} border`}>{cfg.label}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Cliente</p>
                    <p className="font-medium">{detailEvento.title}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Fecha</p>
                    <p className="font-medium">{new Date(detailEvento.start).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Hora</p>
                    <p className="font-medium">{new Date(detailEvento.start).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}{detailEvento.end ? ` - ${new Date(detailEvento.end).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}` : ""}{p?.duracion ? ` (${p.duracion} min)` : ""}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Personas</p>
                    <p className="font-medium">{p?.personas} {p?.personas === 1 ? "persona" : "personas"}</p>
                  </div>
                  {p?.mesa && (
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Mesa</p>
                      <p className="font-medium">{p.mesa}</p>
                    </div>
                  )}
                  {p?.cliente_email && (
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Email</p>
                      <p className="font-medium">{p.cliente_email}</p>
                    </div>
                  )}
                  {p?.cliente_telefono && (
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Teléfono</p>
                      <p className="font-medium">{p.cliente_telefono}</p>
                    </div>
                  )}
                </div>
                {p?.notas && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Notas</p>
                    <p className="text-sm text-muted-foreground italic bg-muted/30 rounded-lg p-3">{p.notas}</p>
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CalendarioReservas;
