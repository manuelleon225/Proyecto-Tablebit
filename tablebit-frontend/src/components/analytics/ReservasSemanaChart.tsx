import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface Props {
  data: { semana: number; total: number }[];
  loading?: boolean;
}

const ReservasSemanaChart = ({ data, loading }: Props) => {
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

export default ReservasSemanaChart;
