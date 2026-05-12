import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { restauranteService, type CalendarioEvento, type ReservaEstado } from "@/services/restauranteService";
import { CalendarDays, ChevronLeft, ChevronRight, AlertCircle, X, Clock, Users, Mail, FileText } from "lucide-react";
import { handleApiError } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const estadoConfig: Record<ReservaEstado, { label: string; color: string; bg: string }> = {
  pendiente: { label: "Pendiente", color: "text-warning", bg: "bg-warning/10" },
  confirmada: { label: "Confirmada", color: "text-success", bg: "bg-success/10" },
  completada: { label: "Completada", color: "text-indigo-500", bg: "bg-indigo-500/10" },
  cancelada: { label: "Cancelada", color: "text-destructive", bg: "bg-destructive/10" },
  no_show: { label: "No Show", color: "text-muted-foreground", bg: "bg-muted/50" },
};

const estadoColors: Record<ReservaEstado, string> = {
  pendiente: "bg-amber-400",
  confirmada: "bg-emerald-500",
  completada: "bg-indigo-500",
  cancelada: "bg-red-500",
  no_show: "bg-gray-400",
};

const CalendarioReservas = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eventos, setEventos] = useState<CalendarioEvento[]>([]);
  const [selectedEvento, setSelectedEvento] = useState<CalendarioEvento | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const { user } = useAuth();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;

  const fetchCalendario = useCallback(async () => {
    if (!user?.restaurante) {
      setLoading(false);
      setError("No tienes un restaurante asociado. Cierra sesión y vuelve a ingresar.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const fechaInicio = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const fechaFin = `${year}-${String(month + 1).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;

      const res = await restauranteService.getCalendario(user.restaurante.id, fechaInicio, fechaFin);
      setEventos(res.data.eventos || []);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  }, [year, month, daysInMonth, user]);

  useEffect(() => {
    fetchCalendario();
  }, [fetchCalendario]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const getEventosForDay = (day: number) => {
    const fechaStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return eventos.filter((e) => e.start.startsWith(fechaStr));
  };

  const handleDayClick = (day: number, eventosDia: CalendarioEvento[]) => {
    if (eventosDia.length === 1) {
      setSelectedEvento(eventosDia[0]);
      setShowDialog(true);
    } else if (eventosDia.length > 1) {
      setSelectedEvento(eventosDia[0]);
      setShowDialog(true);
    }
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(<div key={`e-${i}`} className="aspect-square" />);

  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = isCurrentMonth && d === today.getDate();
    const eventosDia = getEventosForDay(d);

    cells.push(
      <div
        key={d}
        onClick={() => eventosDia.length > 0 && handleDayClick(d, eventosDia)}
        className={`aspect-square rounded-xl border p-1.5 flex flex-col transition-all cursor-pointer overflow-hidden ${
          isToday
            ? "border-primary bg-primary/5 ring-1 ring-primary/20"
            : "border-border hover:border-primary/30 hover:bg-muted/30"
        } ${eventosDia.length > 0 ? "cursor-pointer" : ""}`}
      >
        <span className={`text-xs font-medium ${isToday ? "text-primary font-bold" : "text-foreground"}`}>
          {d}
        </span>
        <div className="flex-1 overflow-hidden mt-0.5 space-y-0.5">
          {eventosDia.slice(0, 3).map((ev) => (
            <div
              key={ev.id}
              className={`h-1.5 rounded-full ${estadoColors[ev.extendedProps.estado as ReservaEstado] || "bg-primary"}`}
            />
          ))}
          {eventosDia.length > 3 && (
            <span className="text-[9px] text-muted-foreground">+{eventosDia.length - 3}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-xl lg:text-2xl font-bold">Calendario de Reservas</h1>
              <p className="text-sm text-muted-foreground">{monthNames[month]} {year}</p>
            </div>
          </div>
          <div className="flex gap-2">
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
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            Cargando calendario...
          </div>
        ) : error ? (
          <div className="text-center py-16 rounded-xl border border-border bg-card">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive/50" />
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchCalendario}>Reintentar</Button>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
              {dias.map((d) => (
                <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 sm:gap-2">{cells}</div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-border flex flex-wrap gap-4">
              {Object.entries(estadoConfig).map(([key, config]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${estadoColors[key as ReservaEstado]}`} />
                  <span className="text-xs text-muted-foreground">{config.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Event detail dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Detalle de Reserva</DialogTitle>
              <DialogDescription>
                {selectedEvento?.start && new Date(selectedEvento.start).toLocaleDateString("es-ES", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </DialogDescription>
            </DialogHeader>
            {selectedEvento && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={`${estadoConfig[selectedEvento.extendedProps.estado as ReservaEstado]?.bg} ${estadoConfig[selectedEvento.extendedProps.estado as ReservaEstado]?.color}`}>
                    {estadoConfig[selectedEvento.extendedProps.estado as ReservaEstado]?.label}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{selectedEvento.title}</p>
                      <p className="text-xs text-muted-foreground">{selectedEvento.extendedProps.personas} personas</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(selectedEvento.start).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                        {selectedEvento.end && ` - ${new Date(selectedEvento.end).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`}
                      </p>
                      <p className="text-xs text-muted-foreground">{selectedEvento.extendedProps.duracion} min</p>
                    </div>
                  </div>

                  {selectedEvento.extendedProps.mesa && (
                    <div className="flex items-center gap-3">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{selectedEvento.extendedProps.mesa}</p>
                    </div>
                  )}

                  {selectedEvento.extendedProps.cliente_email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{selectedEvento.extendedProps.cliente_email}</p>
                    </div>
                  )}

                  {selectedEvento.extendedProps.notas && (
                    <div className="flex items-start gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <p className="text-sm text-muted-foreground">{selectedEvento.extendedProps.notas}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default CalendarioReservas;
