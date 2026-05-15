import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import DashboardLayout from "@/layouts/DashboardLayout";
import { restauranteService } from "@/services/restauranteService";
import { useRestaurante } from "@/context/RestauranteContext";
import { useSEO } from "@/hooks/useSEO";
import { ReservasPorDiaChart } from "@/components/analytics/ReservasPorDiaChart";
import { HorasPicoChart } from "@/components/analytics/HorasPicoChart";
import { DistribucionChart } from "@/components/analytics/DistribucionChart";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const Analytics = () => {
  const { selectedRestauranteId, restauranteActual } = useRestaurante();

  useSEO({ title: "TableBit - Analytics", description: "Métricas y estadísticas de tu restaurante." });

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['dashboard-analytics', selectedRestauranteId],
    queryFn: async () => {
      const res = await restauranteService.getDashboard(selectedRestauranteId!);
      return res.data;
    },
    enabled: !!selectedRestauranteId,
    staleTime: 2 * 60 * 1000,
  });

  const distribucion = [
    { name: "Confirmadas", value: analytics?.confirmadas ?? 0, color: "hsl(160, 84%, 39%)" },
    { name: "Completadas", value: analytics?.completadas ?? 0, color: "hsl(142, 72%, 35%)" },
    { name: "Canceladas", value: analytics?.canceladas ?? 0, color: "hsl(0, 84%, 60%)" },
    { name: "No-shows", value: analytics?.no_shows ?? 0, color: "hsl(240, 4%, 46%)" },
  ];

  const totalActive = (analytics?.confirmadas ?? 0) + (analytics?.completadas ?? 0);
  const weekData = analytics?.reservas_por_semana || [];
  const weekTrend = weekData.length >= 2 ? weekData[weekData.length - 1].total - weekData[weekData.length - 2].total : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">{restauranteActual?.nombre || "Métricas del restaurante"}</p>
          </div>
        </motion.div>

        {/* Mini KPI row */}
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <ReservasPorDiaChart data={analytics?.reservas_por_dia || []} loading={isLoading} />
          </div>
          <DistribucionChart data={distribucion} loading={isLoading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <HorasPicoChart data={analytics?.horas_pico || []} loading={isLoading} />
          {/* Reservas por semana */}
          <ReservasSemanaChart data={weekData} loading={isLoading} />
        </div>
      </div>
    </DashboardLayout>
  );
};

const ReservasSemanaChart = ({ data, loading }: { data: { semana: number; total: number }[]; loading?: boolean }) => {
  if (loading) {
    return (
      <div className="rounded-xl border border-border/50 bg-card p-5 shadow-card">
        <div className="h-5 w-40 bg-muted rounded mb-4" />
        <div className="h-56 animate-pulse rounded-lg bg-muted/50" />
      </div>
    );
  }

  const chartData = data.map((d) => ({
    semana: `S${d.semana % 100}`,
    total: d.total,
  }));

  return (
    <div className="rounded-xl border border-border/50 bg-card p-5 shadow-card">
      <h3 className="font-display text-sm font-semibold mb-4">Reservas por semana</h3>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
            <XAxis dataKey="semana" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="total" radius={[4, 4, 0, 0]} fill="hsl(160, 84%, 39%)" animationDuration={600} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;
