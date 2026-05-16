import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import MainLayout from "@/layouts/MainLayout";
import { restauranteService } from "@/services/restauranteService";
import { CalendarDays, Clock, MapPin, Phone, Users, Star, ChevronRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";
import { formatDate } from "@/lib/date";
import { useState } from "react";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const RestaurantPublicPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedPersonas, setSelectedPersonas] = useState(2);

  const { data, isLoading } = useQuery({
    queryKey: ['public-restaurant', slug],
    queryFn: async () => {
      const res = await restauranteService.getPublicBySlug(slug!);
      return res.data;
    },
    enabled: !!slug,
  });

  const restaurante = data?.restaurante;
  const hours = data?.hours || [];
  const today = new Date().getDay();
  const todayIndex = today === 0 ? 6 : today - 1;
  const todayHour = hours[todayIndex];

  useSEO({
    title: restaurante ? `${restaurante.nombre} - TableBit` : "TableBit",
    description: restaurante?.descripcion?.slice(0, 160) || "Restaurante en TableBit",
    canonical: `https://tablebit.com/restaurante/${slug}`,
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="animate-pulse space-y-6 p-8 max-w-6xl mx-auto">
          <div className="h-96 bg-muted rounded-2xl" />
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="h-4 w-96 bg-muted rounded" />
        </div>
      </MainLayout>
    );
  }

  if (!restaurante) {
    return (
      <MainLayout>
        <div className="text-center py-24"><p className="text-muted-foreground">Restaurante no encontrado</p></div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* HERO */}
      <section className="relative h-[50vh] sm:h-[60vh] lg:h-[65vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/80 via-emerald-900/50 to-black/70 z-10" />
        {restaurante.imagen ? (
          <img src={`/storage/${restaurante.imagen}`} alt={restaurante.nombre} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-emerald-800 to-emerald-900 flex items-center justify-center">
            <span className="font-display text-[clamp(4rem,10vw,8rem)] text-white/10 font-bold">{restaurante.nombre?.[0]}</span>
          </div>
        )}
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 sm:p-10 lg:p-14 max-w-7xl mx-auto w-full">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium mb-4 w-fit"
            style={{ backgroundColor: data?.abierto_ahora ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", color: data?.abierto_ahora ? "#22c55e" : "#ef4444", border: `1px solid ${data?.abierto_ahora ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}` }}>
            <span className={`h-1.5 w-1.5 rounded-full ${data?.abierto_ahora ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
            {data?.abierto_ahora ? "Abierto ahora" : "Cerrado"}
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">{restaurante.nombre}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm sm:text-base text-white/70">
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{restaurante.ciudad || restaurante.direccion}</span>
            <span className="flex items-center gap-1.5">{restaurante.tipo_comida}</span>
            {restaurante.capacidad_total && <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{restaurante.capacidad_total} pax</span>}
            <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />{data?.rating_promedio || "—"} ({data?.total_resenas || 0})</span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Quick info bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Clock, label: "Horario hoy", value: todayHour?.is_closed ? "Cerrado" : `${todayHour?.open_time?.substring(0,5) || "—"} - ${todayHour?.close_time?.substring(0,5) || "—"}` },
                { icon: MapPin, label: "Dirección", value: restaurante.direccion || "—" },
                { icon: Phone, label: "Teléfono", value: restaurante.telefono || "—" },
                { icon: Users, label: "Capacidad", value: `${restaurante.capacidad_total || "—"} personas` },
              ].map((info, i) => (
                <div key={i} className="p-4 rounded-xl border border-border/50 bg-card shadow-card">
                  <info.icon className="h-4 w-4 text-primary mb-2" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{info.label}</p>
                  <p className="text-xs sm:text-sm font-medium truncate">{info.value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {restaurante.descripcion && (
              <div>
                <h2 className="font-display text-xl font-semibold mb-3">Sobre el restaurante</h2>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{restaurante.descripcion}</p>
              </div>
            )}

            {/* Hours */}
            <div>
              <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /> Horarios</h2>
              <div className="space-y-1.5">
                {hours.map((h: any, i: number) => (
                  <div key={i} className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-sm ${i === todayIndex ? 'bg-primary/5 border border-primary/10 font-medium' : 'hover:bg-muted/30'}`}>
                    <span className={i === todayIndex ? 'text-foreground' : 'text-muted-foreground'}>{DAYS[i]}</span>
                    {h.is_closed ? (
                      <span className="text-destructive/70 text-xs">Cerrado</span>
                    ) : (
                      <span className="text-muted-foreground">{h.open_time?.substring(0,5)} - {h.close_time?.substring(0,5)}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Empty state */}
            {!restaurante.descripcion && hours.length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm">
                <p>El restaurante aún no ha completado su perfil</p>
              </div>
            )}
          </div>

          {/* Reservation widget - sticky */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-border/50 bg-card p-6 shadow-elevated">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CalendarDays className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold">Reservar mesa</h3>
                  <p className="text-xs text-muted-foreground">Completa los datos</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Fecha</label>
                  <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border/50 text-sm focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Hora</label>
                  <input type="time" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border/50 text-sm focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Personas</label>
                  <input type="number" min={1} max={20} value={selectedPersonas} onChange={(e) => setSelectedPersonas(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border/50 text-sm focus:outline-none focus:border-primary/50" />
                </div>
                <Button className="w-full h-11 shadow-lg shadow-primary/20" onClick={() => {/* TODO: public reservation flow */}}>
                  <CalendarDays className="h-4 w-4 mr-2" /> Reservar ahora
                </Button>
                <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center pt-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  Confirmación instantánea
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default RestaurantPublicPage;
