import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { restauranteService, type Restaurante } from "@/services/restauranteService";
import MainLayout from "@/layouts/MainLayout";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import {
  MapPin, Clock, Users, Phone, ArrowLeft, CalendarDays,
  Loader2, AlertCircle, Star, CheckCircle2,
} from "lucide-react";
import { handleApiError } from "@/services/api";

const RestauranteDetalle = () => {
  const { id } = useParams<{ id: string }>();
  const [restaurante, setRestaurante] = useState<Restaurante | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [personas, setPersonas] = useState(2);
  const [duracion, setDuracion] = useState(2);
  const [reservando, setReservando] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useSEO({
    title: restaurante ? `TableBit - ${restaurante.nombre}` : "TableBit - Cargando...",
    description: restaurante?.descripcion?.slice(0, 160) || "Detalles del restaurante en TableBit.",
  });

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await restauranteService.getById(Number(id));
        setRestaurante(res.data);
      } catch (err) {
        const apiError = handleApiError(err);
        setError(apiError.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const validateForm = (): string | null => {
    if (!fecha) return "Selecciona una fecha";
    if (!hora) return "Selecciona una hora";
    if (personas < 1) return "El número de personas debe ser al menos 1";
    if (personas > 20) return "Para más de 20 personas contacta al restaurante";
    return null;
  };

  const handleReserva = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      toast({ variant: "destructive", title: "Error de validación", description: validationError });
      return;
    }

    if (!isAuthenticated || !user) {
      toast({ title: "Inicia sesión", description: "Debes iniciar sesión para reservar", variant: "destructive" });
      navigate("/login", { state: { from: `/restaurantes/${id}` } });
      return;
    }

    setReservando(true);
    try {
      await restauranteService.reservaAutomatica({
        cliente_id: user.id,
        restaurante_id: Number(id),
        fecha,
        hora,
        duracion: duracion * 60,
        cantidad_personas: personas,
      });
      toast({
        title: "¡Reserva creada!",
        description: "Tu reserva ha sido confirmada exitosamente.",
      });
      navigate("/mis-reservas");
    } catch (err) {
      const apiError = handleApiError(err);
      toast({ variant: "destructive", title: "Error", description: apiError.message || "No se pudo crear la reserva" });
    } finally {
      setReservando(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  if (loading) return <MainLayout><Loader text="Cargando restaurante..." /></MainLayout>;

  if (error || !restaurante) {
    return (
      <MainLayout>
        <div className="container py-16 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive/50" />
          <p className="text-muted-foreground mb-4">{error || "Restaurante no encontrado"}</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Volver
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-6 sm:py-8 lg:py-12 max-w-6xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 sm:mb-6 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Volver
        </button>

        {/* Hero image */}
        <div className="relative rounded-2xl overflow-hidden border border-border mb-6 sm:mb-8">
          <div className="aspect-[16/7] sm:aspect-[21/8] bg-gradient-to-br from-primary/10 to-primary/5">
            {restaurante.imagen ? (
              <img
                src={restaurante.imagen}
                alt={restaurante.nombre}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <span className="font-display text-7xl sm:text-9xl text-primary/10">
                  {restaurante.nombre[0]?.toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6">
            {restaurante.tipo_comida && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-background/90 backdrop-blur-sm shadow-sm mb-2">
                {restaurante.tipo_comida}
              </span>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-10">
          {/* Info */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                  {restaurante.nombre}
                </h1>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Star className="h-4 w-4 text-warning fill-warning" />
                  <span className="text-sm font-medium">
                    {restaurante.rating_promedio
                      ? restaurante.rating_promedio.toFixed(1)
                      : "Sin reseñas"}
                  </span>
                  {restaurante.total_resenas !== undefined && restaurante.total_resenas > 0 && (
                    <span className="text-xs text-muted-foreground">({restaurante.total_resenas})</span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 flex-shrink-0 text-primary/60" />
                  {restaurante.direccion}
                </span>
                {restaurante.telefono && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4 flex-shrink-0 text-primary/60" />
                    {restaurante.telefono}
                  </span>
                )}
                {restaurante.horario_apertura && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 flex-shrink-0 text-primary/60" />
                    {restaurante.horario_apertura} - {restaurante.horario_cierre}
                  </span>
                )}
                {restaurante.capacidad_total && (
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 flex-shrink-0 text-primary/60" />
                    {restaurante.capacidad_total} personas
                  </span>
                )}
              </div>
            </div>

            {/* Quick info cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                {
                  icon: Clock,
                  label: "Horario",
                  value: restaurante.horario_apertura
                    ? `${restaurante.horario_apertura} - ${restaurante.horario_cierre}`
                    : "Consultar",
                },
                {
                  icon: Users,
                  label: "Capacidad",
                  value: `${restaurante.capacidad_total || "N/A"} personas`,
                },
                {
                  icon: MapPin,
                  label: "Ubicación",
                  value: restaurante.ciudad || restaurante.direccion?.split(",").pop()?.trim() || "N/A",
                },
              ].map((info) => (
                <div key={info.label} className="p-3 sm:p-4 rounded-xl bg-card border border-border shadow-soft">
                  <info.icon className="h-4 w-4 text-primary mb-2" />
                  <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-0.5">
                    {info.label}
                  </p>
                  <p className="text-xs sm:text-sm font-medium truncate">{info.value}</p>
                </div>
              ))}
            </div>

            {restaurante.descripcion && (
              <div>
                <h2 className="font-display text-lg sm:text-xl font-semibold mb-3">Sobre el restaurante</h2>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {restaurante.descripcion}
                </p>
              </div>
            )}
          </div>

          {/* Reservation form */}
          <div className="lg:col-span-1">
            {/* Mobile: floating button */}
            {!showForm && (
              <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
                <Button
                  onClick={() => setShowForm(true)}
                  className="w-full h-12 rounded-xl shadow-elevated text-base font-semibold"
                >
                  <CalendarDays className="h-5 w-5 mr-2" />
                  Reservar mesa
                </Button>
              </div>
            )}

            {/* Mobile: full screen overlay */}
            {showForm && !isAuthenticated && (
              <div className="lg:hidden fixed inset-0 z-50 bg-background p-6 overflow-y-auto animate-slide-up">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-display text-2xl font-bold">Inicia sesión</h2>
                  <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-muted">
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-muted-foreground mb-6">
                  Debes iniciar sesión para reservar una mesa.
                </p>
                <div className="space-y-3">
                  <Button className="w-full" onClick={() => navigate("/login")}>
                    Iniciar sesión
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => navigate("/register")}>
                    Crear cuenta
                  </Button>
                </div>
              </div>
            )}

            {/* Mobile: form overlay */}
            {showForm && isAuthenticated && (
              <div className="lg:hidden fixed inset-0 z-50 bg-background p-6 overflow-y-auto animate-slide-up">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl font-bold">Reservar mesa</h2>
                  <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-muted">
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                </div>
                <ReservationForm
                  fecha={fecha}
                  hora={hora}
                  personas={personas}
                  duracion={duracion}
                  reservando={reservando}
                  today={today}
                  onFechaChange={setFecha}
                  onHoraChange={setHora}
                  onPersonasChange={setPersonas}
                  onDuracionChange={setDuracion}
                  onSubmit={handleReserva}
                />
              </div>
            )}

            {/* Desktop: sticky sidebar */}
            <div className="hidden lg:block sticky top-24">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-elevated">
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <CalendarDays className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold">Reservar mesa</h3>
                    <p className="text-xs text-muted-foreground">Completa los datos de tu reserva</p>
                  </div>
                </div>

                {!isAuthenticated ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-4">Inicia sesión para reservar</p>
                    <Button className="w-full" onClick={() => navigate("/login")}>
                      Iniciar sesión
                    </Button>
                  </div>
                ) : (
                  <ReservationForm
                    fecha={fecha}
                    hora={hora}
                    personas={personas}
                    duracion={duracion}
                    reservando={reservando}
                    today={today}
                    onFechaChange={setFecha}
                    onHoraChange={setHora}
                    onPersonasChange={setPersonas}
                    onDuracionChange={setDuracion}
                    onSubmit={handleReserva}
                  />
                )}
              </div>

              {/* Info card */}
              <div className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <h4 className="font-medium text-sm">Confirmación instantánea</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Tu reserva se confirma al instante. Recibirás los detalles en tu correo electrónico.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

// Extracted form component to reuse in mobile overlay and desktop sidebar
const ReservationForm = ({
  fecha, hora, personas, duracion, reservando, today,
  onFechaChange, onHoraChange, onPersonasChange, onDuracionChange, onSubmit,
}: {
  fecha: string; hora: string; personas: number; duracion: number;
  reservando: boolean; today: string;
  onFechaChange: (v: string) => void; onHoraChange: (v: string) => void;
  onPersonasChange: (v: number) => void; onDuracionChange: (v: number) => void;
  onSubmit: (e: React.FormEvent) => void;
}) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="fecha">Fecha</Label>
      <Input id="fecha" type="date" value={fecha} onChange={(e) => onFechaChange(e.target.value)} min={today} required />
    </div>
    <div className="space-y-2">
      <Label htmlFor="hora">Hora</Label>
      <Input id="hora" type="time" value={hora} onChange={(e) => onHoraChange(e.target.value)} required />
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        <Label htmlFor="personas">Personas</Label>
        <Input id="personas" type="number" min={1} max={20} value={personas} onChange={(e) => onPersonasChange(Number(e.target.value))} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="duracion">Duración (h)</Label>
        <Input id="duracion" type="number" min={1} max={5} value={duracion} onChange={(e) => onDuracionChange(Number(e.target.value))} required />
      </div>
    </div>
    <Button type="submit" className="w-full h-11 rounded-xl" disabled={reservando}>
      {reservando ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Reservando...
        </>
      ) : (
        <>
          <CalendarDays className="h-4 w-4 mr-2" />
          Confirmar reserva
        </>
      )}
    </Button>
  </form>
);

export default RestauranteDetalle;
