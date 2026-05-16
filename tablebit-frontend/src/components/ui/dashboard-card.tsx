import { memo } from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  subtext?: string;
  trend?: { value: number; positive: boolean };
  accent?: string;
  bgIcon?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const DashboardCard = memo(({
  label, value, icon: Icon, subtext, trend, accent = "text-primary", bgIcon = "bg-primary/10", className, style,
}: DashboardCardProps) => (
  <div
    className={cn(
      "group relative overflow-hidden rounded-xl border border-border/50 bg-card p-5",
      "shadow-card hover:shadow-card-hover transition-all duration-300",
      className
    )}
    style={style}
  >
    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="flex items-start justify-between mb-3">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center ring-1 ring-inset ring-border/40", bgIcon)}>
        <Icon className={cn("h-4 w-4", accent)} />
      </div>
    </div>
    <p className="font-display text-2xl font-bold tracking-tight">{value}</p>
    <div className="flex items-center gap-2 mt-1">
      {trend && (
        <span className={cn("text-xs font-medium", trend.positive ? "text-success" : "text-destructive")}>
          {trend.positive ? "+" : ""}{trend.value}%
        </span>
      )}
      {subtext && <span className="text-xs text-muted-foreground">{subtext}</span>}
    </div>
    <div className="absolute -bottom-6 -right-6 h-16 w-16 rounded-full bg-gradient-to-br from-primary/[0.03] to-transparent blur-xl" />
  </div>
));
