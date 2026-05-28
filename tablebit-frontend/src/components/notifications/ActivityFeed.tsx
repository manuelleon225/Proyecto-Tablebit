import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, UserPlus, XCircle, Bell, CheckCircle2 } from "lucide-react";
import { useNotificationStore, type Notification } from "@/stores/notificationStore";
import { cn } from "@/lib/utils";
import { VirtualList } from "@/components/ui/VirtualList";

const iconMap = {
  reserva: UserPlus,
  cancelacion: XCircle,
  sistema: Bell,
  cliente: CheckCircle2,
};

const colorMap = {
  reserva: "text-success bg-success/10",
  cancelacion: "text-destructive bg-destructive/10",
  sistema: "text-primary bg-primary/10",
  cliente: "text-secondary bg-secondary/10",
};

const timeAgo = (date: Date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  return `hace ${Math.floor(hrs / 24)}d`;
};

export const ActivityFeed = () => {
  const { notifications, markAsRead } = useNotificationStore();
  const latestRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    latestRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [notifications.length]);

    const NotificationCard = ({ n }: { n: Notification }) => {
      const Icon = iconMap[n.type];
      return (
        <div
          className={cn(
            "flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer",
            n.read ? "hover:bg-muted/30" : "bg-muted/20 hover:bg-muted/40"
          )}
          onClick={() => markAsRead(n.id)}
        >
          <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0", colorMap[n.type])}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className={cn("text-sm font-medium", !n.read && "text-foreground")}>{n.title}</p>
              {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{n.description}</p>
          </div>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap flex-shrink-0 mt-1">{timeAgo(n.timestamp as Date)}</span>
        </div>
      );
    };

    const items = notifications.slice(0, 20);

    return (
    <div className="space-y-1">
      {notifications.length > 25 ? (
        <VirtualList items={items} itemHeight={72} overscan={3} className="max-h-[400px] pr-1">
          {(n: Notification) => <NotificationCard n={n} />}
        </VirtualList>
      ) : (
        <AnimatePresence initial={false}>
          {items.map((n: Notification) => {
            const Icon = iconMap[n.type];
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={cn(
                  "flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer",
                  n.read ? "hover:bg-muted/30" : "bg-muted/20 hover:bg-muted/40"
                )}
                onClick={() => markAsRead(n.id)}
              >
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0", colorMap[n.type])}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn("text-sm font-medium", !n.read && "text-foreground")}>{n.title}</p>
                    {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{n.description}</p>
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap flex-shrink-0 mt-1">{timeAgo(n.timestamp as Date)}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      )}
    </div>
  );
};
