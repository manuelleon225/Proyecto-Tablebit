import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/layouts/DashboardLayout";
import { restauranteService, type CalendarioEvento } from "@/services/restauranteService";
import { CalendarDays, ChevronLeft, ChevronRight, AlertCircle, X, Clock, Users, Mail, FileText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSEO } from "@/hooks/useSEO";
import { ESTADO_CONFIG, type ReservaEstado } from "@/constants/estados";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const dias = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const CalendarioReservas = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvento, setSelectedEvento] = useState<CalendarioEvento | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const { user } = useAuth();

  useSEO({
    title: "TableBit - Calendario de reservas",
    description: "Visualiza y gestiona las reservas en el calendario de tu restaurante.",
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;

  const startOfMonth = new Date(year, month, 1).toISOString().split("T")[0];
  const endOfMonth = new Date(year, month + 1, 0).toISOString().split("T")[0];

  const restauranteId = user?.restaurante?.id;

  const { data: response, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['calendario', restauranteId, year, month],
    queryFn: async () => {
      const res = await restauranteService.getCalendario(restauranteId!, startOfMonth, endOfMonth);
      return res.data;
    },
    enabled: !!restauranteId,
    staleTime: 2 * 60 * 1000,
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
    <DashboardLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold">Calendario</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {monthNames[month]} {year}
            </p>
          </div>
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

        {loading ? (
          <div className="rounded-xl border border-border bg-card">
            <div className="grid grid-cols-7 border-b border-border">
              {dias.map((d) => (
                <div key={d} className="p-2 sm:p-3 text-center text-xs sm:text-sm font-medium text-muted-foreground bg-muted/30">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="aspect-square p-1 sm:p-2 border-b border-r border-border animate-pulse">
                  <div className="h-6 w-6 bg-muted rounded-full mb-1" />
                  <div className="h-3 w-full bg-muted rounded" />
                </div>
              ))}
            </div>
          </div>
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
                    className={`aspect-square p-1 sm:p-2 border-b border-r border-border hover:bg-muted/20 transition-colors ${
                      isToday ? "bg-primary/5" : ""
                    }`}
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
                            onClick={() => { setSelectedEvento(ev); setShowDialog(true); }}
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
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEvento?.title || "Reserva"}
              {selectedEvento && (
                <Badge className={`${ESTADO_CONFIG[selectedEvento.extendedProps?.estado]?.bg || ""} ${
                  ESTADO_CONFIG[selectedEvento.extendedProps?.estado]?.color || ""
                }`}>
                  {ESTADO_CONFIG[selectedEvento.extendedProps?.estado]?.label || selectedEvento.extendedProps?.estado}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {selectedEvento?.start
                      ? new Date(selectedEvento.start).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
                      : ""}
                    {selectedEvento?.end ? ` - ${new Date(selectedEvento.end).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}` : ""}
                    {selectedEvento?.extendedProps?.duracion && ` (${selectedEvento.extendedProps.duracion} min)`}
                  </span>
                </div>
                {selectedEvento?.extendedProps?.mesa && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedEvento.extendedProps.mesa} · {selectedEvento.extendedProps.personas} personas</span>
                  </div>
                )}
                {selectedEvento?.extendedProps?.cliente_email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedEvento.extendedProps.cliente_email}</span>
                  </div>
                )}
                {selectedEvento?.extendedProps?.notas && (
                  <div className="flex items-start gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{selectedEvento.extendedProps.notas}</span>
                  </div>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CalendarioReservas;
