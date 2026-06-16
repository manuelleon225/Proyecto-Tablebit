import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { restauranteService } from "@/services/restauranteService";
import { useRestaurante } from "@/context/RestauranteContext";
import { useSEO } from "@/hooks/useSEO";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import LazyViewport from "@/components/ui/LazyViewport";
import { ChartSkeleton } from "@/components/skeletons/ChartSkeleton";
import { ReservasPorDiaChart } from "@/components/analytics/ReservasPorDiaChart";
import { HorasPicoChart } from "@/components/analytics/HorasPicoChart";
import { DistribucionChart } from "@/components/analytics/DistribucionChart";
import ReservasSemanaChart from "@/components/analytics/ReservasSemanaChart";

const Analytics = () => {
  const { selectedRestauranteId, restauranteActual } = useRestaurante();

  useSEO({ title: "TableBit - Analytics", description: "Métricas y estadísticas de tu restaurante." });

  const analyticsDateRange = (() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return {
      fecha_inicio: start.toISOString().split("T")[0],
      fecha_fin: end.toISOString().split("T")[0],
    };
  })();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics-data', selectedRestauranteId],
    queryFn: async () => {
      const res = await restauranteService.getDashboard(selectedRestauranteId!, analyticsDateRange);
      return res.data;
    },
    enabled: !!selectedRestauranteId,
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  const distribucion = [
    { name: "Confirmadas", value: analytics?.confirmadas ?? 0, color: "hsl(160, 84%, 39%)" },
    { name: "Completadas", value: analytics?.completadas ?? 0, color: "hsl(142, 72%, 35%)" },
    { name: "Canceladas", value: analytics?.canceladas ?? 0, color: "hsl(0, 84%, 60%)" },
    { name: "No-shows", value: analytics?.no_shows ?? 0, color: "hsl(240, 4%, 46%)" },
  ];

  const hasData = (analytics?.total_reservas_periodo ?? 0) > 0 || (analytics?.reservas_hoy ?? 0) > 0;
  const totalActive = (analytics?.confirmadas ?? 0) + (analytics?.completadas ?? 0);
  const weekData = analytics?.reservas_por_semana || [];
  const weekTrend = weekData.length >= 2 ? weekData[weekData.length - 1].total - weekData[weekData.length - 2].total : 0;

  return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">{restauranteActual?.nombre || "Métricas del restaurante"}</p>
          </div>
        </motion.div>

        {!isLoading && !hasData ? (
          <EmptyState variant="analytics" title="Aún no hay datos suficientes" description="Los analytics aparecerán aquí cuando tengas reservas. Comparte tu restaurante para empezar a recibir clientes." action={{ label: "Compartir restaurante", onClick: () => window.open(`/restaurantes/${restauranteActual?.id}`, "_blank") }} />
        ) : (
          <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Reservas activas", value: totalActive, icon: weekTrend >= 0 ? TrendingUp : TrendingDown, sub: weekTrend === 0 ? "Sin cambios" : `${weekTrend > 0 ? "+" : ""}${weekTrend} vs semana ant.`, color: weekTrend >= 0 ? "text-success" : "text-destructive" },
              { label: "Ocupación", value: `${analytics?.ocupacion_hoy ?? 0}%`, icon: Minus, sub: `${analytics?.mesas_ocupadas_hoy ?? 0}/${analytics?.mesas_totales ?? 0} mesas hoy`, color: "text-primary" },
              { label: "Prom. personas", value: analytics?.personas_promedio ?? 0, icon: Minus, sub: "por reserva", color: "text-secondary" },
              { label: "No-shows", value: analytics?.no_shows ?? 0, icon: TrendingDown, sub: `${analytics?.tasa_no_show ?? 0}% del total`, color: analytics && analytics.tasa_no_show > 10 ? "text-destructive" : "text-muted-foreground" },
            ].map((m, i) => (
              <motion.div key={m.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className="rounded-xl border border-border/50 bg-card p-4 shadow-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                  <m.icon className={`h-4 w-4 ${m.color}`} />
                </div>
                <p className="font-display text-xl font-bold">{m.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{m.sub}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <LazyViewport className="lg:col-span-2" placeholder={<ChartSkeleton />}>
            <div className="lg:col-span-2">
                <ReservasPorDiaChart data={analytics?.reservas_por_dia || []} loading={isLoading} />
            </div>
            </LazyViewport>
            <LazyViewport placeholder={<ChartSkeleton />}>
              <DistribucionChart data={distribucion} loading={isLoading} />
            </LazyViewport>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <LazyViewport placeholder={<ChartSkeleton />}>
              <HorasPicoChart data={analytics?.horas_pico || []} loading={isLoading} />
            </LazyViewport>
            <LazyViewport placeholder={<ChartSkeleton />}>
              <ReservasSemanaChart data={weekData} loading={isLoading} />
            </LazyViewport>
          </div>
          </>
        )}
      </div>
  );
};

export default Analytics;
