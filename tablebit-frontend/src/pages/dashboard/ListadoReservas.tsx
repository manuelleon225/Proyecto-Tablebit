import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { restauranteService, type Reserva } from "@/services/restauranteService";
import Loader from "@/components/Loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, Users, Check, X, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { handleApiError } from "@/services/api";
import { useSEO } from "@/hooks/useSEO";
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

const estadoStyle: Record<string, string> = {
  pendiente: "bg-warning/15 text-warning border-warning/30",
  confirmada: "bg-success/15 text-success border-success/30",
  cancelada: "bg-destructive/15 text-destructive border-destructive/30",
  completada: "bg-muted text-muted-foreground border-border",
  no_show: "bg-gray-100 text-gray-500 border-gray-300",
};

const estadoLabel: Record<string, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  cancelada: "Cancelada",
  completada: "Completada",
  no_show: "No Show",
};

const ListadoReservas = () => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  useSEO({
    title: "TableBit - Listado de reservas",
    description: "Administra todas las reservas de tus restaurantes en TableBit.",
  });

  const fetchReservas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await restauranteService.getReservas();
      setReservas(res.data.data || res.data);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservas();
  }, [fetchReservas]);

  const handleAction = async () => {
    if (!actionId || !actionType) return;
    setProcessing(true);
    try {
      if (actionType === "approve") {
        await restauranteService.actualizarReserva(actionId, { estado: "confirmada" });
        toast({ title: "Reserva aprobada", description: "La reserva ha sido confirmada." });
      } else {
        await restauranteService.cancelarReserva(actionId);
        toast({ title: "Reserva rechazada", description: "La reserva ha sido cancelada." });
      }
      fetchReservas();
    } catch (err) {
      const apiError = handleApiError(err);
      toast({ variant: "destructive", title: "Error", description: apiError.message });
    } finally {
      setProcessing(false);
      setActionType(null);
      setActionId(null);
    }
  };

  return (
    <DashboardLayout>
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold mb-1">Reservas</h1>
        <p className="text-muted-foreground text-sm mb-8">Gestiona las reservas de tu restaurante</p>

        {loading ? (
          <Loader text="Cargando reservas..." />
        ) : error ? (
          <div className="text-center py-16 rounded-xl border border-border bg-card">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive/50" />
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" onClick={fetchReservas}>Reintentar</Button>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left p-4 font-medium text-muted-foreground">Cliente</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Fecha</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Hora</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Personas</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Mesa</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Estado</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {reservas.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        No hay reservas registradas
                      </td>
                    </tr>
                  ) : (
                    reservas.map((r) => (
                      <tr
                        key={r.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-4 font-medium">
                          {r.cliente?.name || `Cliente #${r.cliente_id}`}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {r.fecha}
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {r.hora}
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5" />
                            {r.cantidad_personas}
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {r.mesa ? `#${r.mesa.numero}` : "-"}
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                              estadoStyle[r.estado] || ""
                            }`}
                          >
                            {estadoLabel[r.estado] || r.estado}
                          </span>
                        </td>
                        <td className="p-4">
                          {r.estado === "pendiente" && (
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => {
                                  setActionType("approve");
                                  setActionId(r.id);
                                }}
                                className="p-1.5 rounded-md text-success hover:bg-success/10 transition-colors"
                                title="Aprobar"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setActionType("reject");
                                  setActionId(r.id);
                                }}
                                className="p-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                                title="Rechazar"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <AlertDialog
        open={actionType !== null}
        onOpenChange={(open) => {
          if (!open) {
            setActionType(null);
            setActionId(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "approve" ? "¿Aprobar reserva?" : "¿Rechazar reserva?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "approve"
                ? "La reserva será marcada como confirmada."
                : "La reserva será cancelada. Esta acción no se puede deshacer."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              disabled={processing}
              className={actionType === "reject" ? "bg-destructive text-destructive-foreground" : ""}
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : actionType === "approve" ? (
                "Aprobar"
              ) : (
                "Rechazar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default ListadoReservas;
