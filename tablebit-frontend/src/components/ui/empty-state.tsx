import { type LucideIcon, Inbox, CalendarDays, UtensilsCrossed, TrendingUp, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
  variant?: "default" | "reservation" | "table" | "analytics" | "dashboard";
}

const variantStyles = {
  default: { gradient: "from-card/50 to-card/20", iconBg: "bg-primary/5", iconRing: "ring-primary/10", iconColor: "text-primary/30" },
  reservation: { gradient: "from-card/50 to-card/20", iconBg: "bg-primary/5", iconRing: "ring-primary/10", iconColor: "text-primary/30" },
  table: { gradient: "from-card/50 to-card/20", iconBg: "bg-secondary/10", iconRing: "ring-secondary/10", iconColor: "text-secondary/40" },
  analytics: { gradient: "from-card/50 to-card/20", iconBg: "bg-success/10", iconRing: "ring-success/10", iconColor: "text-success/30" },
  dashboard: { gradient: "from-card/50 to-card/20", iconBg: "bg-accent", iconRing: "ring-accent-foreground/10", iconColor: "text-accent-foreground/30" },
};

const variantIcons: Record<string, LucideIcon> = {
  default: Inbox,
  reservation: CalendarDays,
  table: UtensilsCrossed,
  analytics: TrendingUp,
  dashboard: LayoutDashboard,
};

export const EmptyState = ({ icon: CustomIcon, title, description, action, className, variant = "default" }: EmptyStateProps) => {
  const styles = variantStyles[variant];
  const Icon = CustomIcon || variantIcons[variant];

  return (
    <div className={cn(`flex flex-col items-center justify-center py-16 px-6 rounded-2xl border-2 border-dashed border-border/30 bg-gradient-to-b ${styles.gradient}`, className)}>
      <div className={`h-14 w-14 rounded-2xl ${styles.iconBg} flex items-center justify-center mb-4 ${styles.iconRing}`}>
        <Icon className={`h-7 w-7 ${styles.iconColor}`} />
      </div>
      <h3 className="font-display text-base font-semibold mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mb-5 max-w-xs text-center">{description}</p>}
      {action && (
        <Button variant="outline" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};
