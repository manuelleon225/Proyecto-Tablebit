import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export const EmptyState = ({ icon: Icon, title, description, action, className }: EmptyStateProps) => (
  <div className={cn("flex flex-col items-center justify-center py-16 px-6 rounded-2xl border-2 border-dashed border-border/30 bg-gradient-to-b from-card/50 to-card/20", className)}>
    <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center mb-4 ring-1 ring-primary/10">
      <Icon className="h-7 w-7 text-primary/30" />
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
