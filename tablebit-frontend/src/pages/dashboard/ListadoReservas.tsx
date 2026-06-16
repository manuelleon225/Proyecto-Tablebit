import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { restauranteService } from "@/services/restauranteService";
import type { Reserva } from "@/types/restaurante";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, Users, AlertCircle, Search, X, User } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import { useRestaurante } from "@/context/RestauranteContext";
import { ESTADO_CONFIG } from "@/constants/estados";
import { formatDate } from "@/lib/date";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { ReservationTableSkeleton } from "@/components/skeletons/ReservationTableSkeleton";

const ListadoReservas = () => {
  const { selectedRestauranteId, restauranteActual } = useRestaurante();
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<string>("todas");

  useSEO({ title: "TableBit - Listado de reservas", description: "Administra todas las reservas." });

  const { data: reservas = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ['reservas-admin', selectedRestauranteId],
    queryFn: async () => {
      if (!selectedRestauranteId) return [];
      const res = await restauranteService.getReservas({ restaurante_id: selectedRestauranteId });
      const raw = res.data;
      return (raw?.data && Array.isArray(raw.data)) ? raw.data : (Array.isArray(raw) ? raw : []);
    },
    enabled: !!selectedRestauranteId,
    staleTime: 2 * 60 * 1000,
    refetchOnMount: true,
  });

  useEffect(() => { if (selectedRestauranteId) refetch(); }, [selectedRestauranteId]);

  const reservasList = Array.isArray(reservas) ? reservas : [];
  const filtered = reservasList.filter((r: Reserva) => {
    if (estadoFilter !== "todas" && r.estado !== estadoFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (r.cliente?.name?.toLowerCase() || "").includes(q) || (r.restaurante?.nombre?.toLowerCase() || "").includes(q);
    }
    return true;
  });

  return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold tracking-tight">Reservas</h1>
            <p className="text-sm text-muted-foreground mt-1">{restauranteActual?.nombre || "Todas las reservas"}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar cliente o restaurante..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm bg-card/50 backdrop-blur-sm border-border/50" />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="h-3.5 w-3.5 text-muted-foreground" /></button>}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {["todas", "pendiente", "confirmada", "completada", "cancelada", "no_show"].map((e) => (
              <button key={e} onClick={() => setEstadoFilter(e)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  estadoFilter === e ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                }`}>{e === "todas" ? "Todas" : ESTADO_CONFIG[e]?.label || e}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <ReservationTableSkeleton />
        ) : error ? (
          <EmptyState icon={AlertCircle} title="Error al cargar reservas" action={{ label: "Reintentar", onClick: () => refetch() }} />
        ) : filtered.length === 0 ? (
          search ? (
            <EmptyState variant="reservation" title="Sin resultados" description="No encontramos reservas con esos criterios. Intenta con otros filtros." />
          ) : (
            <EmptyState variant="reservation" title="Aún no hay reservas" description="Aún no tienes reservas. Comparte tu restaurante para empezar a recibir clientes." />
          )
        ) : (
          <div className="contents">
            {/* Desktop table */}
            <div className="hidden sm:block rounded-xl border border-border/50 bg-card overflow-hidden shadow-card">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/20">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Cliente</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Fecha</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Hora</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Personas</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Mesa</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r: Reserva, i: number) => (
                      <tr key={r.id} className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors" style={{ animationDelay: `${i * 30}ms` }}>
                        <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">{r.cliente?.name?.charAt(0) || <User className="h-3.5 w-3.5" />}</div><span className="font-medium">{r.cliente?.name || `Cliente #${r.cliente_id}`}</span></div></td>
                        <td className="px-4 py-3 text-muted-foreground"><div className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{formatDate(r.fecha)}</div></td>
                        <td className="px-4 py-3 text-muted-foreground"><div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{r.hora?.substring(0, 5)}</div></td>
                        <td className="px-4 py-3 text-muted-foreground"><div className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{r.cantidad_personas}</div></td>
                        <td className="px-4 py-3 text-muted-foreground">{r.mesa ? `#${r.mesa.numero}` : "-"}</td>
                        <td className="px-4 py-3"><StatusBadge estado={r.estado} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {filtered.map((r: Reserva) => (
                <div key={r.id} className="rounded-xl border border-border/50 bg-card p-4 shadow-card space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">{r.cliente?.name?.charAt(0) || <User className="h-3.5 w-3.5" />}</div><span className="text-sm font-medium">{r.cliente?.name || "Cliente"}</span></div>
                    <StatusBadge estado={r.estado} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{formatDate(r.fecha)}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{r.hora?.substring(0, 5)}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{r.cantidad_personas} pers.</span>
                    <span className="flex items-center gap-1">Mesa {r.mesa ? `#${r.mesa.numero}` : "-"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
  );
};

export default ListadoReservas;
