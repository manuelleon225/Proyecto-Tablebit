import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { restauranteService } from "@/services/restauranteService";
import { useRestaurante } from "@/context/RestauranteContext";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Save, AlertCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { handleApiError } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

interface DayHour {
  day_of_week: number;
  is_closed: boolean;
  open_time: string;
  close_time: string;
}

const defaultHours: DayHour[] = DAYS.map((_, i) => ({
  day_of_week: i,
  is_closed: false,
  open_time: "",
  close_time: "",
}));

const HorariosPage = () => {
  const { selectedRestauranteId, restauranteActual } = useRestaurante();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [hours, setHours] = useState<DayHour[]>(defaultHours);

  useSEO({ title: "TableBit - Horarios", description: "Configura los horarios de tu restaurante." });

  const { data: rawData, isLoading, isError } = useQuery({
    queryKey: ['restaurant-hours', selectedRestauranteId],
    queryFn: async () => {
      const res = await restauranteService.getHours(selectedRestauranteId!);
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!selectedRestauranteId,
  });

  useEffect(() => {
    if (!rawData) return;
    if (rawData.length > 0) {
      setHours(defaultHours.map((d, i) => {
        const existing = rawData.find((h: any) => h.day_of_week === i);
        return existing ? { day_of_week: i, is_closed: existing.is_closed, open_time: existing.open_time?.substring(0, 5) || "09:00", close_time: existing.close_time?.substring(0, 5) || "23:00" } : d;
      }));
    }
  }, [rawData]);

  const mutation = useMutation({
    mutationFn: async () => {
      await restauranteService.updateHours(selectedRestauranteId!, { hours });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-hours', selectedRestauranteId] });
      queryClient.invalidateQueries({ queryKey: ['mis-restaurantes'] });
      toast({ title: "Horarios guardados", description: "Los horarios se actualizaron correctamente." });
    },
    onError: (err) => {
      toast({ variant: "destructive", title: "Error", description: handleApiError(err).message });
    },
  });

  const toggleDay = (idx: number) => {
    setHours((prev) => prev.map((h, i) => i === idx ? { ...h, is_closed: !h.is_closed } : h));
  };

  const updateTime = (idx: number, field: "open_time" | "close_time", value: string) => {
    setHours((prev) => prev.map((h, i) => i === idx ? { ...h, [field]: value } : h));
  };

  if (!selectedRestauranteId) {
    return (
        <div className="text-center py-20 text-muted-foreground">Selecciona un restaurante para configurar horarios</div>
    );
  }

  return (
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold tracking-tight">Horarios</h1>
            <p className="text-sm text-muted-foreground mt-1">{restauranteActual?.nombre || "Configura los horarios de atención"}</p>
          </div>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="shadow-lg shadow-primary/20">
            {mutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Guardando...</> : <><Save className="h-4 w-4 mr-1.5" /> Guardar</>}
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {hours.map((day, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className={`rounded-xl border p-4 transition-all ${day.is_closed ? "bg-muted/20 border-border/30" : "bg-card border-border/50 shadow-card"}`}>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-3 min-w-[140px]">
                    <Switch checked={!day.is_closed} onCheckedChange={() => toggleDay(i)} id={`day-${i}`} />
                    <Label htmlFor={`day-${i}`} className={`text-sm font-medium cursor-pointer ${day.is_closed ? "text-muted-foreground line-through" : ""}`}>{DAYS[i]}</Label>
                  </div>
                  {!day.is_closed && (
                    <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                      <div className="relative flex-1">
                        <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <input type="time" value={day.open_time} onChange={(e) => updateTime(i, "open_time", e.target.value)}
                          className="w-full h-9 pl-8 pr-3 rounded-lg bg-muted/50 border border-border/50 text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10" />
                      </div>
                      <span className="text-muted-foreground text-sm">→</span>
                      <div className="relative flex-1">
                        <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <input type="time" value={day.close_time} onChange={(e) => updateTime(i, "close_time", e.target.value)}
                          className="w-full h-9 pl-8 pr-3 rounded-lg bg-muted/50 border border-border/50 text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10" />
                      </div>
                    </div>
                  )}
                  {day.is_closed && <span className="text-xs text-muted-foreground ml-auto">Cerrado</span>}
                </div>
                {!day.is_closed && day.close_time <= day.open_time && (
                  <p className="text-xs text-destructive mt-2 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> La hora de cierre debe ser posterior a la apertura</p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
  );
};

export default HorariosPage;
