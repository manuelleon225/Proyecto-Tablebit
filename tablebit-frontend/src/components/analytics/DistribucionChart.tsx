import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { AnalyticsCard } from "./AnalyticsCard";

interface Props {
  data: { name: string; value: number; color: string }[];
  loading?: boolean;
}

const COLORS = ["hsl(160, 84%, 39%)", "hsl(142, 72%, 35%)", "hsl(38, 92%, 50%)", "hsl(0, 84%, 60%)", "hsl(240, 4%, 46%)"];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border/50 shadow-elevated rounded-lg px-3 py-2 text-sm">
      <p className="font-semibold">{payload[0].name}: {payload[0].value}</p>
    </div>
  );
};

export const DistribucionChart = ({ data, loading }: Props) => {
  if (loading) {
    return (
      <AnalyticsCard title="Distribución" subtitle="Estados de reservas">
        <div className="h-56 animate-pulse rounded-lg bg-muted/50" />
      </AnalyticsCard>
    );
  }

  return (
    <AnalyticsCard title="Distribución" subtitle="Estados de reservas">
      <div className="h-56 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" animationDuration={800}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute flex flex-col items-center pointer-events-none">
          <p className="text-2xl font-bold font-display">{data.reduce((a, b) => a + b.value, 0)}</p>
          <p className="text-xs text-muted-foreground">total</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 mt-2 justify-center">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
            <span className="text-xs text-muted-foreground">{d.name} <span className="font-medium text-foreground">{d.value}</span></span>
          </div>
        ))}
      </div>
    </AnalyticsCard>
  );
};
