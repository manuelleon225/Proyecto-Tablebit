import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { AnalyticsCard } from "./AnalyticsCard";

interface HoraData {
  hora: number;
  total: number;
}

interface Props {
  data: HoraData[];
  loading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border/50 shadow-elevated rounded-lg px-3 py-2 text-sm">
      <p className="text-xs text-muted-foreground">{String(label).padStart(2, "0")}:00</p>
      <p className="font-semibold text-foreground">{payload[0].value} reservas</p>
    </div>
  );
};

export const HorasPicoChart = ({ data, loading }: Props) => {
  if (loading) {
    return (
      <AnalyticsCard title="Horas pico" subtitle="Distribución horaria">
        <div className="h-56 animate-pulse rounded-lg bg-muted/50" />
      </AnalyticsCard>
    );
  }

  const chartData = data.map((h) => ({ hora: `${String(h.hora).padStart(2, "0")}:00`, total: h.total }));

  return (
    <AnalyticsCard title="Horas pico" subtitle="Distribución horaria">
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
            <XAxis dataKey="hora" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="total" radius={[4, 4, 0, 0]} animationDuration={600}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={`hsl(${142 + i * 5}, 76%, ${55 - i * 3}%)`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsCard>
  );
};
