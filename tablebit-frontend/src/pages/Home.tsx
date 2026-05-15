import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { restauranteService } from "@/services/restauranteService";
import MainLayout from "@/layouts/MainLayout";
import RestaurantCard from "@/components/RestaurantCard";
import StructuredData from "@/components/StructuredData";
import { Search, UtensilsCrossed, AlertCircle, ChevronRight, Sparkles, Check, ArrowRight, Star, Users, Clock, Shield, BarChart3, Bell, Smartphone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";

const SkeletonCard = () => (
  <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-md"><div className="aspect-[16/10] bg-muted animate-pulse" /><div className="p-5 space-y-3"><div className="h-5 w-3/4 bg-muted rounded animate-pulse" /><div className="h-4 w-full bg-muted rounded animate-pulse" /><div className="flex gap-3"><div className="h-3 w-20 bg-muted rounded animate-pulse" /><div className="h-3 w-16 bg-muted rounded animate-pulse" /></div></div></div>
);

const features = [
  { icon: Clock, title: "Reservas instantáneas", desc: "Tus clientes reservan en segundos. Confirmación automática sin esperas." },
  { icon: BarChart3, title: "Analytics en vivo", desc: "Dashboard con ocupación, horas pico, tendencias y métricas en tiempo real." },
  { icon: Bell, title: "Notificaciones", desc: "Recordatorios automáticos, confirmaciones por email y alertas en tiempo real." },
  { icon: Shield, title: "Multi-restaurante", desc: "Administra múltiples locales desde un solo panel con control total." },
  { icon: Users, title: "Gestión de mesas", desc: "Mapa interactivo con drag & drop. Visualiza y gestiona tu salón." },
  { icon: Smartphone, title: "Mobile-first", desc: "Experiencia optimizada para móviles. Tus clientes reservan desde cualquier dispositivo." },
];

const pricing = [
  { name: "Starter", price: "$0", desc: "Para probar TableBit", features: ["1 restaurante", "50 reservas/mes", "Dashboard básico", "Gestión de mesas"] },
  { name: "Pro", price: "$29", desc: "Para restaurantes profesionales", features: ["5 restaurantes", "Reservas ilimitadas", "Analytics avanzados", "Notificaciones email", "Exportación CSV", "Soporte prioritario"], popular: true },
  { name: "Enterprise", price: "$79", desc: "Para cadenas y grandes operaciones", features: ["Restaurantes ilimitados", "API completa", "White-label", "Soporte dedicado", "SLAs", "Onboarding personalizado"] },
];

const faq = [
  { q: "¿Qué es TableBit?", a: "TableBit es un SaaS de gestión de reservas para restaurantes. Permite a los clientes reservar mesas online y a los dueños administrar su negocio con analytics en tiempo real." },
  { q: "¿Necesito conocimientos técnicos?", a: "No. TableBit está diseñado para ser usado por cualquier persona. La configuración inicial toma menos de 5 minutos." },
  { q: "¿Puedo probar TableBit gratis?", a: "Sí. El plan Starter es completamente gratis sin límite de tiempo. Incluye 1 restaurante y 50 reservas por mes." },
  { q: "¿Ofrecen migración de datos?", a: "Sí. En planes Pro y Enterprise incluimos migración gratuita desde OpenTable, Resy o cualquier otro sistema." },
];

const Home = () => {
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useSEO({ title: "TableBit - Reserva de Mesas en Restaurantes", description: "SaaS moderno de gestión de reservas para restaurantes. Dashboard, analytics, notificaciones y más.", canonical: "https://tablebit.com/" });

  const { data: restaurantes = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ['restaurantes', searchQuery],
    queryFn: async () => {
      const res = searchQuery ? await restauranteService.buscar({ nombre: searchQuery }) : await restauranteService.getAll();
      const data = res.data;
      return Array.isArray(data) ? data : (data.data || []);
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setSearchQuery(search.trim()); };
  const handleClearSearch = () => { setSearch(""); setSearchQuery(""); };

  const displayRestaurantes = search.trim()
    ? restaurantes.filter((r: any) => r.nombre?.toLowerCase().includes(search.toLowerCase()) || r.direccion?.toLowerCase().includes(search.toLowerCase()) || r.tipo_comida?.toLowerCase().includes(search.toLowerCase()))
    : restaurantes;

  return (
    <MainLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 min-h-[70vh] flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgMjBoLTAuMDEiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA0KSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIi8+PC9zdmc+')] opacity-30" />
        </div>
        <div className="container relative z-10 text-center py-20 px-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 text-xs font-medium text-white/80 mb-6 border border-white/10">
            <Sparkles className="h-3.5 w-3.5" />
            SaaS de gestión de reservas para restaurantes
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight max-w-4xl mx-auto">
            Gestiona tu restaurante
            <br />
            <span className="text-secondary">como un profesional</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-white/60 max-w-xl mx-auto">
            Dashboard en tiempo real, reservas automáticas, analytics y gestión de mesas. Todo en un solo lugar.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => navigate("/register")} className="h-12 px-8 text-base shadow-xl shadow-primary/30 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
              Comenzar gratis <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/login")} className="h-12 px-8 text-base bg-white/5 text-white border-white/20 hover:bg-white/10">
              Iniciar sesión
            </Button>
          </div>

          {/* Hero search */}
          <form onSubmit={handleSearch} className="mt-10 mx-auto max-w-lg">
            <div className="flex gap-2 bg-white/5 backdrop-blur-sm rounded-xl p-1.5 border border-white/10">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar restaurantes..." className="pl-10 bg-transparent border-0 text-white placeholder:text-white/40 h-11 focus-visible:ring-0 focus-visible:ring-offset-0" />
              </div>
              <Button type="submit" size="sm" className="h-11 px-5">Buscar</Button>
            </div>
          </form>

          {/* Social proof */}
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-white/40">
            <span className="flex items-center gap-1"><Star className="h-3.5 w-3-5 fill-secondary text-secondary" /> 4.9/5</span>
            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> 150+ restaurantes</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> 99.9% uptime</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-24 px-4">
        <div className="container max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">Todo lo que necesitas</h2>
            <p className="mt-3 text-muted-foreground max-w-lg mx-auto">TableBit combina reservas, analytics y gestión en una plataforma moderna.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={f.title} className="group rounded-xl border border-border/50 bg-card p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display text-base font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Restaurants Grid */}
      <section className="pb-20 px-4">
        <div className="container max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">{searchQuery ? `Resultados para "${searchQuery}"` : "Restaurantes populares"}</h2>
              {!loading && displayRestaurantes.length > 0 && <p className="mt-1 text-sm text-muted-foreground">{displayRestaurantes.length} encontrado{displayRestaurantes.length !== 1 ? "s" : ""}</p>}
            </div>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">{Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}</div>
          ) : error ? (
            <div className="text-center py-16 rounded-2xl border border-border bg-card max-w-5xl mx-auto">
              <AlertCircle className="h-10 w-10 mx-auto mb-4 text-destructive/40" />
              <p className="text-sm text-muted-foreground font-medium">No pudimos cargar los restaurantes</p>
              <p className="text-xs text-muted-foreground/60 mb-4">Error de conexión con el servidor. Verifica tu conexión.</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>Reintentar</Button>
            </div>
          ) : displayRestaurantes.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border-2 border-dashed border-border/60 bg-card/50 max-w-5xl mx-auto">
              <Search className="h-10 w-10 mx-auto mb-4 text-muted-foreground/20" />
              <p className="text-base text-muted-foreground font-medium">No se encontraron restaurantes</p>
              {search ? <Button variant="ghost" size="sm" onClick={handleClearSearch} className="mt-4">Ver todos</Button> : null}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {displayRestaurantes.map((r: any) => <RestaurantCard key={r.id} restaurante={r} />)}
            </div>
          )}
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-muted/30 border-y border-border/50 px-4">
        <div className="container max-w-5xl text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">Precios simples</h2>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto mb-12">Sin sorpresas. Precios transparentes que escalan con tu negocio.</p>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            {pricing.map((p) => (
              <div key={p.name} className={`relative rounded-xl border ${p.popular ? 'border-primary/30 bg-card shadow-card-hover ring-1 ring-primary/20' : 'border-border/50 bg-card shadow-card'} p-6 transition-all duration-300 hover:-translate-y-1`}>
                {p.popular && <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">Más popular</div>}
                <h3 className="font-display text-lg font-semibold mt-1">{p.name}</h3>
                <p className="text-3xl font-bold mt-2">{p.price}<span className="text-sm font-normal text-muted-foreground">/mes</span></p>
                <p className="text-sm text-muted-foreground mt-1 mb-6">{p.desc}</p>
                <ul className="space-y-2.5 mb-8">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm"><Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />{f}</li>
                  ))}
                </ul>
                <Button className={`w-full ${p.popular ? '' : 'variant-outline'}`} variant={p.popular ? 'default' : 'outline'} onClick={() => navigate("/register")}>
                  {p.name === "Enterprise" ? "Contactar" : "Comenzar ahora"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="container max-w-3xl">
          <h2 className="font-display text-3xl font-bold tracking-tight text-center mb-12">Preguntas frecuentes</h2>
          <div className="space-y-4">
            {faq.map((item) => (
              <details key={item.q} className="group rounded-xl border border-border/50 bg-card p-5 shadow-card open:ring-1 open:ring-primary/10 transition-all">
                <summary className="flex items-center justify-between cursor-pointer text-sm font-semibold list-none">
                  {item.q}
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-emerald-900 to-emerald-800 px-4">
        <div className="container max-w-2xl text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">¿Listo para empezar?</h2>
          <p className="mt-3 text-white/60 text-lg max-w-md mx-auto">Únete a más de 150 restaurantes que ya confían en TableBit.</p>
          <Button size="lg" onClick={() => navigate("/register")} className="mt-8 h-12 px-10 text-base shadow-xl shadow-black/20 bg-white text-emerald-900 hover:bg-white/90">
            Crear cuenta gratis <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </section>

      <StructuredData data={{
        "@context": "https://schema.org", "@type": "WebApplication", name: "TableBit",
        description: "SaaS de gestión de reservas para restaurantes", applicationCategory: "BusinessApplication",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      }} />
    </MainLayout>
  );
};

export default Home;
