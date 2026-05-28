import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { restauranteService } from "@/services/restauranteService";
import { useRestaurante } from "@/context/RestauranteContext";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { Plus, Store, Users, CalendarDays, UtensilsCrossed, ChevronRight, Building2, MapPin, ImageIcon } from "lucide-react";

const MisRestaurantesPage = () => {
  const { misRestaurantes, setSelectedRestauranteId } = useRestaurante();
  const navigate = useNavigate();

  useSEO({ title: "TableBit - Mis restaurantes", description: "Gestiona tus restaurantes." });

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold tracking-tight">Mis Restaurantes</h1>
            <p className="text-sm text-muted-foreground mt-1">{misRestaurantes.length} restaurante{misRestaurantes.length !== 1 ? "s" : ""} registrado{misRestaurantes.length !== 1 ? "s" : ""}</p>
          </div>
          <Button onClick={() => navigate("/onboarding/restaurante")} className="shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4 mr-1.5" /> Nuevo restaurante
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {misRestaurantes.map((r: any, i: number) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="group rounded-xl border border-border/50 bg-card p-5 shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer"
              onClick={() => { setSelectedRestauranteId(r.id); navigate("/dashboard/media"); }}
            >
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center flex-shrink-0 border border-primary/10">
                  <Store className="h-7 w-7 text-primary/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-base font-semibold group-hover:text-primary transition-colors">{r.nombre}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" /> {r.ciudad || "Sin ciudad"}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                    <Building2 className="h-3 w-3" /> {r.tipo_comida || "General"}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors flex-shrink-0 mt-1" />
              </div>
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/30 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {r.mesas?.length || 0} mesas</span>
                <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {r.reservas_count || 0} reservas</span>
                <span className="flex items-center gap-1"><UtensilsCrossed className="h-3.5 w-3.5" /> {r.capacidad_total || "-"} pax</span>
              </div>
            </motion.div>
          ))}
        </div>

        {misRestaurantes.length === 0 && (
          <div className="text-center py-20 rounded-2xl border-2 border-dashed border-border/30">
            <Store className="h-12 w-12 mx-auto mb-4 text-muted-foreground/20" />
            <h3 className="font-display text-lg font-semibold mb-1">Aún no tienes restaurantes</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">Crea tu primer restaurante y empieza a gestionar reservas.</p>
            <Button onClick={() => navigate("/onboarding/restaurante")}>
              <Plus className="h-4 w-4 mr-1.5" /> Crear restaurante
            </Button>
          </div>
        )}
      </div>
  );
};

export default MisRestaurantesPage;
