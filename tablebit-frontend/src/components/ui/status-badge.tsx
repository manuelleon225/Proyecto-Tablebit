import { cn } from "@/lib/utils";

type StatusKey = "pendiente" | "confirmada" | "completada" | "cancelada" | "no_show";

interface StatusBadgeProps {
  estado: StatusKey;
  className?: string;
}

const config: Record<StatusKey, { label: string; dot: string; bg: string }> = {
  pendiente: { label: "Pendiente", dot: "bg-warning", bg: "bg-warning/10 text-warning border-warning/20" },
  confirmada: { label: "Confirmada", dot: "bg-success", bg: "bg-success/10 text-success border-success/20" },
  completada: { label: "Completada", dot: "bg-primary", bg: "bg-primary/10 text-primary border-primary/20" },
  cancelada: { label: "Cancelada", dot: "bg-destructive", bg: "bg-destructive/10 text-destructive border-destructive/20" },
  no_show: { label: "No Show", dot: "bg-muted-foreground", bg: "bg-muted/50 text-muted-foreground border-border" },
};

export const StatusBadge = ({ estado, className }: StatusBadgeProps) => {
  const c = config[estado] || config.pendiente;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", c.bg, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} />
      {c.label}
    </span>
  );
};
