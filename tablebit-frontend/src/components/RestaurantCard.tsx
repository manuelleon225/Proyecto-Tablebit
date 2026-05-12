import { type Restaurante } from "@/services/restauranteService";
import { MapPin, Clock, Users, Star, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface RestaurantCardProps {
  restaurante: Restaurante;
}

const RestaurantCard = ({ restaurante }: RestaurantCardProps) => {
  const getGradient = (id: number) => {
    const gradients = [
      "from-emerald-400 to-teal-500",
      "from-amber-400 to-orange-500",
      "from-blue-400 to-indigo-500",
      "from-pink-400 to-rose-500",
      "from-purple-400 to-violet-500",
      "from-cyan-400 to-blue-500",
    ];
    return gradients[id % gradients.length];
  };

  return (
    <Link
      to={`/restaurantes/${restaurante.id}`}
      className="group block rounded-2xl border border-border bg-card overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/20"
    >
      {/* Image area */}
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {restaurante.imagen ? (
          <img
            src={restaurante.imagen}
            alt={restaurante.nombre}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${getGradient(restaurante.id)} flex items-center justify-center`}>
            <span className="font-display text-5xl sm:text-6xl text-white/80 drop-shadow-lg">
              {restaurante.nombre[0]?.toUpperCase()}
            </span>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        {/* Top right badge */}
        {restaurante.tipo_comida && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-background/90 backdrop-blur-sm shadow-md">
              {restaurante.tipo_comida}
            </span>
          </div>
        )}

        {/* Bottom left - capacity */}
        {restaurante.capacidad_total && (
          <div className="absolute bottom-3 left-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-background/90 backdrop-blur-sm shadow-md text-muted-foreground">
              <Users className="h-3 w-3" />
              {restaurante.capacidad_total}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-base sm:text-lg font-semibold text-foreground group-hover:text-primary transition-colors truncate leading-snug">
              {restaurante.nombre}
            </h3>

            {restaurante.direccion && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{restaurante.direccion}</span>
              </p>
            )}
          </div>

          {/* Hover arrow */}
          <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
        </div>

        {/* Bottom info row */}
        <div className="mt-3.5 pt-3.5 border-t border-border/50 flex items-center gap-3 text-xs text-muted-foreground">
          {restaurante.horario_apertura && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {restaurante.horario_apertura} – {restaurante.horario_cierre}
            </span>
          )}
          <span className="flex items-center gap-1 ml-auto">
            <Star className="h-3 w-3 text-warning fill-warning" />
            {restaurante.rating_promedio
              ? restaurante.rating_promedio.toFixed(1)
              : "N/A"}
            {restaurante.total_resenas !== undefined && (
              <span className="text-muted-foreground/60">({restaurante.total_resenas})</span>
            )}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
