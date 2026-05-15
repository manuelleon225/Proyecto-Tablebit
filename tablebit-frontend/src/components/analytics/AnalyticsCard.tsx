import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnalyticsCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  delay?: number;
  action?: React.ReactNode;
}

export const AnalyticsCard = ({ title, subtitle, children, className, delay = 0, action }: AnalyticsCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: [0.25, 0.1, 0.25, 1] }}
    className={cn(
      "rounded-xl border border-border/50 bg-card p-5 shadow-card hover:shadow-card-hover transition-all duration-300",
      className
    )}
  >
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="font-display text-sm font-semibold">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
    {children}
  </motion.div>
);
