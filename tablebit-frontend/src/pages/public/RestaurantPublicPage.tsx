import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import MainLayout from "@/layouts/MainLayout";
import { restauranteService } from "@/services/restauranteService";
import { useAuth } from "@/context/AuthContext";
import { CalendarDays, Clock, MapPin, Phone, Users, Star, CheckCircle2, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { handleApiError } from "@/services/api";
import { useSEO } from "@/hooks/useSEO";
import RestaurantCard from "@/components/RestaurantCard";
import StructuredData from "@/components/StructuredData";
import { getImageUrl, getImageVariantUrl, HERO_DESKTOP, HERO_MOBILE, PLACEHOLDER_LOGO } from "@/lib/image";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const RestaurantPublicPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedPersonas, setSelectedPersonas] = useState(2);
  const [reservationSent, setReservationSent] = useState(false);
  const [reservationData, setReservationData] = useState<any>(null);
  const [reservationError, setReservationError] = useState<string | null>(null);
  const [resSuccessTimer, setResSuccessTimer] = useState<ReturnType<typeof setTimeout>>();
  const [formErrors, setFormErrors] = useState<{ date?: string; time?: string; personas?: string }>({});
  const widgetRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const reservaMutation = useMutation({
    mutationFn: (data: Parameters<typeof restauranteService.reservaAutomatica>[0]) =>
      restauranteService.reservaAutomatica(data),
    onSuccess: (res) => {
      setReservationData(res.data?.reserva || null);
      setReservationSent(true);
      setSelectedDate("");
      setSelectedTime("");
      toast({ title: "Reserva confirmada", description: "Recibirás un correo con los detalles." });
      if (resSuccessTimer) clearTimeout(resSuccessTimer);
      setResSuccessTimer(setTimeout(() => setReservationSent(false), 8000));
    },
    onError: (err) => {
      const msg = handleApiError(err).message;
      setReservationError(msg);
    },
  });

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
  const telefonoLink = restaurante?.telefono?.replace(/[^\d+]/g, "");
  const mapsQuery = restaurante ? encodeURIComponent(`${restaurante.direccion}, ${restaurante.ciudad}`) : "";

  // Build slider images: primary + gallery (exclude logos, deduplicate)
  const slides = useMemo(() => {
    const seen = new Set<string>();
    const imgs: { src: string; label: string }[] = [];
    // Primary image first
    if (restaurante?.imagen) {
      seen.add(restaurante.imagen);
      imgs.push({ src: restaurante.imagen, label: restaurante.nombre || "" });
    }
    // Gallery images: only horizontal types, exclude logos
    if (Array.isArray(restaurante?.imagenes)) {
      restaurante.imagenes.forEach((img: any) => {
        const ruta = img.ruta || img.path;
        if (!ruta) return;
        if (img.tipo === "logo") return;
        if (seen.has(ruta)) return;
        seen.add(ruta);
        imgs.push({ src: ruta, label: img.nombre_original || "" });
      });
    }
    return imgs;
  }, [restaurante]);

  const [slideIndex, setSlideIndex] = useState(0);
  const [sliderPaused, setSliderPaused] = useState(false);
  const touchStart = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Autoplay
  useEffect(() => {
    if (slides.length <= 1 || sliderPaused) return;
    intervalRef.current = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(intervalRef.current);
  }, [slides.length, sliderPaused]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      if (resSuccessTimer) clearTimeout(resSuccessTimer);
    };
  }, [resSuccessTimer]);

  const pauseSlider = useCallback(() => {
    setSliderPaused(true);
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => setSliderPaused(false), 8000);
  }, []);

  const goToSlide = useCallback((i: number) => {
    setSlideIndex(i);
    pauseSlider();
  }, [pauseSlider]);

  const nextSlide = useCallback(() => {
    setSlideIndex((prev) => (prev + 1) % slides.length);
    pauseSlider();
  }, [slides.length, pauseSlider]);

  const prevSlide = useCallback(() => {
    setSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
    pauseSlider();
  }, [slides.length, pauseSlider]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; }, []);
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      e.preventDefault();
      diff > 0 ? nextSlide() : prevSlide();
    }
  }, [nextSlide, prevSlide]);

  const handleReservaClick = useCallback(() => {
    if (widgetRef.current) {
      widgetRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      widgetRef.current.classList.add("ring-2", "ring-primary/30", "ring-offset-2", "rounded-2xl");
      setTimeout(() => {
        widgetRef.current?.classList.remove("ring-2", "ring-primary/30", "ring-offset-2", "rounded-2xl");
        widgetRef.current?.querySelector("input")?.focus();
      }, 600);
    }
  }, []);

  const validateForm = useCallback((): boolean => {
    const errors: { date?: string; time?: string; personas?: string } = {};
    if (!selectedDate) errors.date = "Selecciona una fecha";
    if (!selectedTime) errors.time = "Selecciona una hora";
    if (selectedPersonas < 1) errors.personas = "Mínimo 1 persona";
    if (selectedPersonas > 20) errors.personas = "Máximo 20 personas";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [selectedDate, selectedTime, selectedPersonas]);

  const handleSubmitReserva = useCallback(() => {
    if (!validateForm() || !restaurante?.id) return;
    if (!isAuthenticated) { navigate("/login", { state: { from: `/restaurante/${slug}` } }); return; }
    if (reservaMutation.isPending) return;
    setReservationError(null);
    reservaMutation.mutate({
      restaurante_id: restaurante.id,
      fecha: selectedDate,
      hora: selectedTime,
      cantidad_personas: selectedPersonas,
    });
  }, [validateForm, restaurante?.id, isAuthenticated, selectedDate, selectedTime, selectedPersonas, navigate, slug, reservaMutation]);

  // Generate time slots based on restaurant hours
  const timeSlots = useMemo(() => {
    if (!selectedDate || !hours.length) return [];
    const parts = selectedDate.split("-").map(Number);
    const dayIdx = new Date(parts[0], parts[1] - 1, parts[2]).getDay();
    const todayHours = hours[dayIdx === 0 ? 6 : dayIdx - 1];
    if (!todayHours || todayHours.is_closed) return [];

    const open = todayHours.open_time?.substring(0, 5) || "12:00";
    const close = todayHours.close_time?.substring(0, 5) || "23:00";
    const openMin = parseInt(open.split(":")[0]) * 60 + parseInt(open.split(":")[1]);
    const closeMin = parseInt(close.split(":")[0]) * 60 + parseInt(close.split(":")[1]);
    const now = new Date();
    const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const isToday = selectedDate === localDate;
    const nowMin = isToday ? now.getHours() * 60 + now.getMinutes() : 0;

    const slots: string[] = [];
    for (let m = openMin; m <= closeMin - 60; m += 30) {
      if (isToday && m <= nowMin) continue;
      const h = Math.floor(m / 60);
      const min = m % 60;
      slots.push(`${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
    }
    return slots;
  }, [selectedDate, hours]);

  useSEO({
    title: restaurante ? `${restaurante.nombre} - TableBit` : "TableBit",
    description: restaurante?.descripcion?.slice(0, 160) || "Restaurante en TableBit",
    canonical: `${window.location.origin}/restaurante/${slug}`,
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
      {/* HERO SLIDER — cinematic */}
      <section className="relative h-[50vh] sm:h-[58vh] lg:h-[62vh] overflow-hidden bg-emerald-950"
        onMouseEnter={() => setSliderPaused(true)}
        onMouseLeave={() => setSliderPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Cinematic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 via-40% to-black/10 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent z-10" />

        {/* Slides — only render visible + adjacent */}
        {slides.length > 0 ? (
          <div className="relative h-full w-full" style={{ aspectRatio: "16/9" }}>
            {slides.map((slide, i) => {
              const isActive = i === slideIndex;
              // Desktop: use 1920 variant. Mobile: use 640 variant
              const src = getImageVariantUrl(slide.src, isActive ? HERO_DESKTOP : HERO_MOBILE) || getImageUrl(slide.src);
              return (
                <img
                  key={i}
                  src={src || ""}
                  alt={slide.label}
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchpriority={i === 0 ? "high" : undefined}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${isActive ? "opacity-100" : "opacity-0"}`}
                  style={{ willChange: "opacity" }}
                />
              );
            })}
          </div>
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-emerald-800 to-emerald-900 flex items-center justify-center">
            <span className="font-display text-[clamp(4rem,10vw,8rem)] text-white/10 font-bold">{restaurante.nombre?.[0]}</span>
          </div>
        )}

        {/* Nav arrows — minimal, táctiles */}
        {slides.length > 1 && (
          <>
            <button onClick={prevSlide} className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/25 hover:bg-black/45 text-white/80 hover:text-white flex items-center justify-center transition-all duration-300 backdrop-blur-sm active:scale-95">
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            <button onClick={nextSlide} className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black/25 hover:bg-black/45 text-white/80 hover:text-white flex items-center justify-center transition-all duration-300 backdrop-blur-sm active:scale-95">
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </>
        )}

        {/* Dots — minimal */}
        {slides.length > 1 && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {slides.map((_, i) => (
              <button key={i} onClick={() => goToSlide(i)}
                className={`rounded-full transition-all duration-500 ${i === slideIndex ? "w-7 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40 hover:bg-white/60"}`}
                aria-label={`Imagen ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Overlay content — editorial */}
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 sm:p-10 lg:p-14 max-w-7xl mx-auto w-full">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-3">
              {restaurante.logo && (
                <img src={getImageUrl(restaurante.logo) || PLACEHOLDER_LOGO} alt=""
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl object-cover ring-2 ring-white/20 shadow-lg flex-shrink-0" />
              )}
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium text-white/80 bg-white/10 backdrop-blur-sm mb-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${data?.abierto_ahora ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
                  {data?.abierto_ahora ? "Abierto ahora" : "Cerrado"}
                </div>
                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">{restaurante.nombre}</h1>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-white/60">
              <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{restaurante.ciudad || restaurante.direccion}</span>
              <span className="text-white/30">/</span>
              <span>{restaurante.tipo_comida}</span>
              <span className="text-white/30">/</span>
              <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />{data?.rating_promedio || "—"}</span>
              {restaurante.capacidad_total && (
                <><span className="text-white/30">/</span><span>{restaurante.capacidad_total} pax</span></>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main content — editorial spacing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-14 pb-28 lg:pb-12">
        <div className="grid lg:grid-cols-3 gap-10 lg:gap-16">
          <div className="lg:col-span-2 space-y-12">
            {/* Hero info — editorial header */}
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                {restaurante.logo && (
                  <img src={getImageUrl(restaurante.logo) || PLACEHOLDER_LOGO} alt=""
                    className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl object-cover ring-1 ring-border shadow-sm flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">{restaurante.nombre}</h1>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-sm text-muted-foreground/70">
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{restaurante.ciudad || restaurante.direccion}</span>
                    <span aria-hidden="true">·</span>
                    <span>{restaurante.tipo_comida}</span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />{data?.rating_promedio || "—"} <span className="text-muted-foreground/50">({data?.total_resenas || 0})</span></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick actions row */}
            <div className="flex flex-wrap items-center gap-3">
              <Button size="default" className="h-11 px-5 shadow-sm gap-2" onClick={handleReservaClick}>
                <CalendarDays className="h-4 w-4" /> Reservar mesa
              </Button>
              {telefonoLink && (
                <Button variant="outline" size="default" className="h-11 px-4 gap-2" asChild>
                  <a href={`tel:${telefonoLink}`}><Phone className="h-4 w-4" /> Llamar</a>
                </Button>
              )}
              {mapsQuery && (
                <Button variant="ghost" size="sm" className="h-11 px-3 gap-1.5 text-muted-foreground hover:text-foreground" asChild>
                  <a href={`https://www.google.com/maps/search/${mapsQuery}`} target="_blank" rel="noopener noreferrer">
                    <MapPin className="h-4 w-4" /> Cómo llegar
                  </a>
                </Button>
              )}
            </div>

            {/* Status inline */}
            <div className="flex items-center gap-4 text-sm">
              <span className={`inline-flex items-center gap-1.5 font-medium ${data?.abierto_ahora ? "text-green-600" : "text-red-500"}`}>
                <span className={`h-2 w-2 rounded-full ${data?.abierto_ahora ? "bg-green-500" : "bg-red-500"}`} />
                {data?.abierto_ahora ? "Abierto ahora" : "Cerrado"}
              </span>
              {todayHour && !todayHour.is_closed && (
                <span className="text-muted-foreground/60">
                  {todayHour.open_time?.substring(0,5)} – {todayHour.close_time?.substring(0,5)}
                </span>
              )}
            </div>

            <hr className="border-border/30" />

            {/* Description */}
            {restaurante.descripcion && (
              <div className="max-w-prose">
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed whitespace-pre-line">{restaurante.descripcion}</p>
                {restaurante.amenities && Array.isArray(restaurante.amenities) && restaurante.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {restaurante.amenities.map((a: string) => (
                      <span key={a} className="px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 text-xs font-medium">{a}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Hours — clean table */}
            <div>
              <h2 className="font-display text-lg font-semibold mb-4">Horarios</h2>
              <div className="space-y-0.5 max-w-sm">
                {hours.map((h: any, i: number) => (
                  <div key={i} className={`flex items-center justify-between py-2 px-3 rounded-lg text-sm ${i === todayIndex ? 'bg-primary/5 ring-1 ring-primary/10 font-medium' : ''}`}>
                    <span className={i === todayIndex ? 'text-foreground' : 'text-muted-foreground'}>{DAYS[i]}</span>
                    <span className={h.is_closed ? "text-red-400 text-xs font-medium" : "text-muted-foreground"}>
                      {h.is_closed ? "Cerrado" : `${h.open_time?.substring(0,5)} – ${h.close_time?.substring(0,5)}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gallery — polished masonry */}
            {(() => {
              const galleryImgs = Array.isArray(restaurante.imagenes) ? restaurante.imagenes.filter((img: any) => img.tipo !== "logo") : [];
              return galleryImgs.length > 0 && (
              <div>
                <h2 className="font-display text-lg font-semibold mb-5">Galería</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {galleryImgs.map((img: any, i: number) => {
                    const isWide = i === 0;
                    return (
                      <div key={img.id || i}
                        className={`${isWide ? "col-span-2 row-span-2" : ""} rounded-xl overflow-hidden bg-muted group cursor-pointer shadow-sm hover:shadow-md transition-all duration-500`}>
                        <img src={getImageUrl(img.ruta) || ""} alt={`${restaurante.nombre} - Foto ${i + 1}`}
                          loading="lazy"
                          className="h-full w-full object-cover transition-all duration-700 group-hover:scale-[1.03]" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )})()}

            {/* Related */}
            {Array.isArray(data?.related) && data.related.length > 0 && (
              <div>
                <h2 className="font-display text-xl font-semibold mb-4">También te puede interesar</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.related.map((r: any) => <RestaurantCard key={r.id} restaurante={r} />)}
                </div>
              </div>
            )}

            {!restaurante.descripcion && hours.length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm" role="status">
                <p>El restaurante aún no ha completado su perfil</p>
              </div>
            )}
          </div>

          {/* Reservation widget — premium */}
          <div className="lg:col-span-1" ref={widgetRef}>
            <div className="sticky top-24 rounded-2xl border border-border/20 bg-card shadow-lg overflow-hidden transition-all duration-300">
              {/* Header */}
              <div className="p-5 border-b border-border/10 bg-gradient-to-b from-primary/[0.02] to-transparent">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-base font-semibold">Reserva tu mesa</h3>
                    <p className="text-xs text-muted-foreground/60 mt-0.5">Completa los datos para reservar</p>
                  </div>
                  <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <CalendarDays className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </div>

              {/* Success state — real data */}
              {reservationSent ? (
                <div className="p-8 text-center animate-fade-in">
                  <div className="h-14 w-14 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-7 w-7 text-success" />
                  </div>
                  <p className="font-semibold text-base">Reserva confirmada</p>
                  <p className="text-sm text-muted-foreground mt-1">{restaurante?.nombre || "Restaurante"}</p>

                  {reservationData && (
                    <div className="mt-4 space-y-1 text-sm text-muted-foreground bg-muted/30 rounded-xl p-4 border border-border/30">
                      {reservationData.mesa?.numero && (
                        <p className="font-medium text-foreground">Mesa #{reservationData.mesa.numero}</p>
                      )}
                      <p>{reservationData.cantidad_personas} persona{reservationData.cantidad_personas !== 1 ? "s" : ""} · {reservationData.hora?.substring(0, 5)}</p>
                      <p className="text-xs text-muted-foreground/60 capitalize">{new Date(reservationData.fecha + "T12:00:00").toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}</p>
                    </div>
                  )}

                  <div className="mt-5 flex flex-col gap-2">
                    <Button size="sm" variant="outline" className="w-full" onClick={() => navigate("/mis-reservas")}>
                      Ver mis reservas
                    </Button>
                    <Button size="sm" variant="ghost" className="w-full text-muted-foreground" onClick={() => setReservationSent(false)}>
                      Nueva reserva
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-5 space-y-4">
                  {/* Date */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground/80 mb-1.5 block">Fecha</label>
                    <input type="date" value={selectedDate}
                      onChange={(e) => { setSelectedDate(e.target.value); setFormErrors((p) => ({ ...p, date: undefined })); }}
                      min={new Date().toISOString().split("T")[0]}
                      className={`w-full h-11 px-3 rounded-xl border bg-background text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 ${formErrors.date ? "border-red-400 ring-2 ring-red-100" : "border-border/40"}`}
                      aria-label="Fecha de reserva"
                    />
                    {formErrors.date && <p className="text-xs text-red-500 mt-1">{formErrors.date}</p>}
                  </div>

                  {/* Time + People */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground/80 mb-1.5 block">Hora</label>
                      <select value={selectedTime}
                        onChange={(e) => { setSelectedTime(e.target.value); setFormErrors((p) => ({ ...p, time: undefined })); }}
                        className={`w-full h-11 px-3 rounded-xl border bg-background text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%239ca3af%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_12px_center] bg-no-repeat ${formErrors.time ? "border-red-400 ring-2 ring-red-100" : "border-border/40"}`}
                        aria-label="Hora de reserva"
                      >
                        <option value="">Seleccionar</option>
                        {timeSlots.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      {formErrors.time && <p className="text-xs text-red-500 mt-1">{formErrors.time}</p>}
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground/80 mb-1.5 block">Personas</label>
                      <select value={selectedPersonas}
                        onChange={(e) => { setSelectedPersonas(Number(e.target.value)); setFormErrors((p) => ({ ...p, personas: undefined })); }}
                        className={`w-full h-11 px-3 rounded-xl border bg-background text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%239ca3af%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_12px_center] bg-no-repeat ${formErrors.personas ? "border-red-400 ring-2 ring-red-100" : "border-border/40"}`}
                        aria-label="Número de personas"
                      >
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>{n} {n === 1 ? "persona" : "personas"}</option>
                        ))}
                        <option value={20}>20+ personas</option>
                      </select>
                      {formErrors.personas && <p className="text-xs text-red-500 mt-1">{formErrors.personas}</p>}
                    </div>
                  </div>

                  {/* Error state — friendly messages */}
                  {reservationError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>
                          {reservationError.includes("No hay mesas disponibles") ? (
                            <>No hay mesas disponibles para esa fecha y hora. Prueba otro horario o una cantidad diferente de personas.</>
                          ) : reservationError.includes("cerrado") ? (
                            <>El restaurante está cerrado en ese horario. Consulta los horarios de atención.</>
                          ) : reservationError.includes("demasiadas") || reservationError.includes("límite") ? (
                            <>Ya alcanzaste el límite de reservas para hoy. Intenta con otra fecha.</>
                          ) : (
                            reservationError
                          )}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Submit */}
                  <Button className="w-full h-12 shadow-sm active:scale-[0.98] transition-all duration-150 text-sm font-semibold"
                    onClick={handleSubmitReserva}
                    disabled={reservaMutation.isPending}
                    aria-label="Reservar mesa"
                  >
                    {reservaMutation.isPending ? (
                      <><svg className="h-4 w-4 mr-2 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Procesando reserva...</>
                    ) : (
                      <><CalendarDays className="h-4 w-4 mr-2" /> Reservar</>
                    )}
                  </Button>

                  {/* Footer */}
                  <p className="text-[11px] text-center text-muted-foreground/40 flex items-center justify-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-500/60" />
                    Sin costo · Cancelación gratuita
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky mobile CTA — premium */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background/90 backdrop-blur-lg border-t border-border/30 safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-2.5 px-4 py-3 max-w-lg mx-auto">
          <Button size="default" className="flex-1 h-11 shadow-sm text-sm gap-2 active:scale-[0.98] transition-all duration-150" onClick={handleReservaClick}>
            <CalendarDays className="h-4 w-4" /> Reservar
          </Button>
          {telefonoLink && (
            <Button variant="outline" size="icon" className="h-11 w-11 flex-shrink-0 active:scale-95 transition-all duration-150" asChild>
              <a href={`tel:${telefonoLink}`} aria-label="Llamar"><Phone className="h-4 w-4" /></a>
            </Button>
          )}
          {telefonoLink && (
            <Button variant="outline" size="icon" className="h-11 w-11 flex-shrink-0 active:scale-95 transition-all duration-150" asChild>
              <a href={`https://wa.me/${telefonoLink.replace("+", "")}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* JSON-LD */}
      <StructuredData data={{
        "@context": "https://schema.org",
        "@type": "Restaurant",
        name: restaurante.nombre,
        description: restaurante.descripcion || undefined,
        image: getImageUrl(restaurante.imagen) ? `${window.location.origin}${getImageUrl(restaurante.imagen)}` : undefined,
        servesCuisine: restaurante.tipo_comida || undefined,
        telephone: restaurante.telefono || undefined,
        address: {
          "@type": "PostalAddress",
          streetAddress: restaurante.direccion || undefined,
          addressLocality: restaurante.ciudad || undefined,
          addressCountry: "CO",
        },
        openingHoursSpecification: hours.filter((h: any) => !h.is_closed).map((h: any) => ({
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"][h.day_of_week],
          opens: h.open_time?.substring(0, 5),
          closes: h.close_time?.substring(0, 5),
        })),
        aggregateRating: data?.total_resenas > 0 ? {
          "@type": "AggregateRating",
          ratingValue: data.rating_promedio,
          reviewCount: data.total_resenas,
        } : undefined,
      }} />
    </MainLayout>
  );
};

export default RestaurantPublicPage;
