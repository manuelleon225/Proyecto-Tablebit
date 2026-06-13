import type { Restaurante } from "@/types/restaurante";
import { MapPin, Star, Clock, CalendarDays, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getImageUrl, PLACEHOLDER_LOGO } from "@/lib/image";

interface RestaurantCardProps {
  restaurante: Restaurante;
}

const RestaurantCard = ({ restaurante }: RestaurantCardProps) => {
  const linkTo = restaurante.slug ? `/restaurante/${restaurante.slug}` : `/restaurantes/${restaurante.id}`;

  return (
    <Link to={linkTo} className="group block rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-0.5">
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {(() => {
          const cover = restaurante.imagen || (Array.isArray(restaurante.imagenes) ? restaurante.imagenes.find((img: any) => img.tipo !== "logo")?.ruta : null);
          return cover ? (
            <img src={getImageUrl(cover) || ""}
              alt={restaurante.nombre} loading="lazy"
              className="h-full w-full object-cover transition-all duration-700 group-hover:scale-[1.04]" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-muted/80 to-muted flex items-center justify-center">
              <span className="font-display text-5xl text-muted-foreground/20">{restaurante.nombre?.[0]}</span>
            </div>
          );
        })()}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />

        {restaurante.tipo_comida && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-medium bg-background/80 backdrop-blur-sm shadow-sm">
            {restaurante.tipo_comida}
          </span>
        )}

        {/* Rating on image */}
        <span className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium bg-background/80 backdrop-blur-sm shadow-sm">
          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
          {restaurante.rating_promedio?.toFixed(1) || "—"}
        </span>

        {/* Hover CTA */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="px-4 py-2 rounded-xl bg-white text-foreground text-sm font-semibold shadow-lg translate-y-2 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2">
            <CalendarDays className="h-4 w-4" /> Ver restaurante
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          {restaurante.logo && (
            <img src={getImageUrl(restaurante.logo) || PLACEHOLDER_LOGO} alt=""
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl object-cover ring-1 ring-border flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-base sm:text-lg font-semibold leading-snug group-hover:text-primary transition-colors truncate">{restaurante.nombre}</h3>
            <p className="mt-1 flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{restaurante.ciudad || restaurante.direccion}</span>
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-2" />
        </div>

        <div className="mt-3 pt-3 border-t border-border/30 flex items-center gap-3 text-xs text-muted-foreground">
          {restaurante.horario_apertura && (
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{restaurante.horario_apertura?.substring(0,5)}</span>
          )}
          {restaurante.capacidad_total && (
            <span className="flex items-center gap-1"><svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {restaurante.capacidad_total} pax
            </span>
          )}
          <span className="ml-auto flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
            {restaurante.rating_promedio?.toFixed(1) || "—"}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
