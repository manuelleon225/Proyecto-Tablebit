import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/layouts/DashboardLayout";
import { restauranteService, type Reserva } from "@/services/restauranteService";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, Users, AlertCircle } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { ESTADO_CONFIG } from "@/constants/estados";
import { formatDate } from "@/lib/date";

const ListadoReservas = () => {
  useSEO({
    title: "TableBit - Listado de reservas",
    description: "Administra todas las reservas de tus restaurantes en TableBit.",
  });

  const { data: reservas = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ['reservas-admin'],
    queryFn: async () => {
      const res = await restauranteService.getReservas();
      return res.data.data || res.data;
    },
    staleTime: 2 * 60 * 1000,
  });

  const errorMessage = error
    ? (error as any)?.response?.data?.message || "Error al cargar reservas"
    : null;

  return (
    <DashboardLayout>
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold mb-1">Reservas</h1>
        <p className="text-muted-foreground text-sm mb-8">Gestiona las reservas de tu restaurante</p>

        {loading ? (
          <Loader text="Cargando reservas..." />
        ) : errorMessage ? (
          <div className="text-center py-16 rounded-xl border border-border bg-card">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive/50" />
            <p className="text-muted-foreground mb-4">{errorMessage}</p>
            <Button variant="outline" onClick={() => refetch()}>Reintentar</Button>
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
                  </tr>
                </thead>
                <tbody>
                  {reservas.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        No hay reservas registradas
                      </td>
                    </tr>
                  ) : (
                    reservas.map((r: Reserva) => (
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
                            {formatDate(r.fecha)}
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
                              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${ESTADO_CONFIG[r.estado]?.bg || ""}`}
                            >
                              {ESTADO_CONFIG[r.estado]?.label || r.estado}
                          </span>
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
    </DashboardLayout>
  );
};

export default ListadoReservas;
