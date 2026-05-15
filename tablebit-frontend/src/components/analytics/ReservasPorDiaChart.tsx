import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { AnalyticsCard } from "./AnalyticsCard";
import { motion } from "framer-motion";

interface DayData {
  fecha: string;
  total: number;
}

interface Props {
  data: DayData[];
  loading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border/50 shadow-elevated rounded-lg px-3 py-2 text-sm">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold text-foreground">{payload[0].value} reservas</p>
    </div>
  );
};

export const ReservasPorDiaChart = ({ data, loading }: Props) => {
  const [range, setRange] = useState<7 | 14 | 30>(14);

  if (loading) {
    return (
      <AnalyticsCard title="Reservas por día" subtitle="Últimos 14 días" className="col-span-2">
        <div className="h-64 animate-pulse rounded-lg bg-muted/50" />
      </AnalyticsCard>
    );
  }

  const chartData = data.slice(-range).map((d) => ({
    ...d,
    fecha: new Date(d.fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "short" }),
  }));

  return (
    <AnalyticsCard
      title="Reservas por día"
      subtitle={`Últimos ${range} días`}
      className="col-span-2"
      action={
        <div className="flex gap-1">
          {[7, 14, 30].map((n) => (
            <button key={n} onClick={() => setRange(n as typeof range)}
              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                range === n ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              }`}>{n}d</button>
          ))}
        </div>
      }
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.15} />
                <stop offset="100%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
            <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="total" stroke="hsl(160, 84%, 39%)" strokeWidth={2} fill="url(#areaFill)" animationDuration={800} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsCard>
  );
};
