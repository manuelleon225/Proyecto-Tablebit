import { useQuery } from "@tanstack/react-query";
import api from "@/services/api";
import { AlertTriangle, Loader2 } from "lucide-react";

const AlertWidget = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-alerts-count'],
    queryFn: async () => {
      const res = await api.get("/admin/alerts");
      const items = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      return {
        total: items.length,
        critical: items.filter((a: any) => a.type === "critical" && a.status === "active").length,
      };
    },
    refetchInterval: 60000,
  });

  if (isLoading) return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
  if (!data || data.total === 0) return null;

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium ${
      data.critical > 0 ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"
    }`}>
      <AlertTriangle className="h-3 w-3" />
      <span>{data.total} alerta{data.total !== 1 ? "s" : ""}</span>
    </div>
  );
};

export default AlertWidget;
