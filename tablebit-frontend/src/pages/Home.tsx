import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { restauranteService, type Restaurante } from "@/services/restauranteService";
import MainLayout from "@/layouts/MainLayout";
import RestaurantCard from "@/components/RestaurantCard";
import StructuredData from "@/components/StructuredData";
import { Search, UtensilsCrossed, AlertCircle, MapPin, Clock, Star, ChevronRight, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";

const SkeletonCard = () => (
  <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-md">
    <div className="aspect-[16/10] bg-muted animate-pulse" />
    <div className="p-5 space-y-3">
      <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
      <div className="h-4 w-full bg-muted rounded animate-pulse" />
      <div className="flex gap-3">
        <div className="h-3 w-20 bg-muted rounded animate-pulse" />
        <div className="h-3 w-16 bg-muted rounded animate-pulse" />
      </div>
    </div>
  </div>
);

const Home = () => {
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useSEO({
    title: "TableBit - Reserva tu mesa en restaurantes",
    description: "Descubre los mejores restaurantes cerca de ti y reserva tu mesa al instante.",
    canonical: "https://tablebit.com/",
  });

  const { data: restaurantes = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ['restaurantes', searchQuery],
    queryFn: async () => {
      const res = searchQuery
        ? await restauranteService.buscar({ nombre: searchQuery })
        : await restauranteService.getAll();
      const data = res.data;
      return Array.isArray(data) ? data : (data.data || []);
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(search.trim());
  };

  const handleClearSearch = () => {
    setSearch("");
    setSearchQuery("");
  };

  const displayRestaurantes = search.trim()
    ? restaurantes.filter(
        (r) =>
          r.nombre.toLowerCase().includes(search.toLowerCase()) ||
          r.direccion?.toLowerCase().includes(search.toLowerCase()) ||
          r.tipo_comida?.toLowerCase().includes(search.toLowerCase())
      )
    : restaurantes;

  const shouldCenterGrid = displayRestaurantes.length > 0 && displayRestaurantes.length < 3;

  return (
    <MainLayout>
      {/* Hero — reducido y con CTA claro */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/95 to-primary/90 min-h-[48vh] sm:min-h-[52vh] lg:min-h-[58vh] flex items-center">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-secondary/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full border border-primary-foreground/5" />
        </div>

        <div className="container relative z-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm px-4 py-2 text-xs font-medium text-primary-foreground/90 mb-5 sm:mb-6 border border-primary-foreground/10">
            <Sparkles className="h-3.5 w-3.5" />
            Reserva tu mesa en segundos
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-[1.1] tracking-tight">
            Encuentra el restaurante
            <br />
            <span className="text-secondary">perfecto</span>
          </h1>

          <p className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg text-primary-foreground/70 max-w-lg lg:max-w-xl mx-auto px-4">
            Descubre los mejores restaurantes cerca de ti y reserva tu mesa al instante.
          </p>

          <form onSubmit={handleSearch} className="mt-6 sm:mt-8 mx-auto max-w-xl px-4">
            <div className="flex gap-2 sm:gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, cocina o dirección..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 sm:pl-12 h-11 sm:h-13 rounded-xl sm:rounded-full bg-background text-foreground border-0 shadow-lg text-sm sm:text-base pr-10 focus-visible:ring-2 focus-visible:ring-secondary"
                />
                {search && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
              <Button type="submit" className="h-11 sm:h-13 rounded-xl sm:rounded-full px-5 sm:px-7 shadow-lg text-sm sm:text-base font-semibold bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                Buscar
              </Button>
            </div>
          </form>

          {/* Quick stats */}
          <div className="mt-8 sm:mt-10 flex flex-wrap justify-center gap-5 sm:gap-8 px-4">
            {[
              { icon: MapPin, label: "Ciudades", value: "15+" },
              { icon: UtensilsCrossed, label: "Restaurantes", value: "200+" },
              { icon: Star, label: "Reseñas", value: "4.8" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2 sm:gap-2.5">
                <stat.icon className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-secondary" />
                <div className="text-left">
                  <p className="text-base sm:text-lg font-bold text-primary-foreground">{stat.value}</p>
                  <p className="text-[10px] sm:text-[11px] text-primary-foreground/60 uppercase tracking-wider">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ¿Cómo funciona? */}
      <section className="py-14 sm:py-16 lg:py-20 bg-background">
        <div className="container">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold">¿Cómo funciona?</h2>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
              Reserva en 3 simples pasos
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Descubre",
                desc: "Explora restaurantes por ubicación, tipo de cocina o calificación.",
                icon: Search,
              },
              {
                step: "02",
                title: "Reserva",
                desc: "Elige fecha, hora y número de personas. Confirmación instantánea.",
                icon: Clock,
              },
              {
                step: "03",
                title: "Disfruta",
                desc: "Llega al restaurante y disfruta de una experiencia inolvidable.",
                icon: Star,
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group relative p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 text-5xl sm:text-6xl font-display font-bold text-primary/5 group-hover:text-primary/10 transition-colors">
                  {feature.step}
                </div>
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 sm:mb-5 group-hover:bg-primary/15 transition-colors">
                  <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <h3 className="font-display text-lg sm:text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Restaurantes populares */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="container">
          {/* Section header */}
          <div className="max-w-5xl mx-auto mb-8 sm:mb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold">
                  {search.trim() ? `Resultados para "${search}"` : "Restaurantes populares"}
                </h2>
                {!loading && displayRestaurantes.length > 0 && (
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                    {displayRestaurantes.length} encontrado{displayRestaurantes.length !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
              {!loading && !search && displayRestaurantes.length > 4 && (
                <Button variant="ghost" size="sm" className="text-primary self-start sm:self-auto hover:bg-primary/5" onClick={() => navigate("/buscar-restaurantes")}>
                  Ver todos <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>

          {/* Cards area */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-14 sm:py-16 rounded-2xl border border-border bg-card max-w-5xl mx-auto">
              <AlertCircle className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-destructive/40" />
              <p className="text-sm sm:text-base text-muted-foreground mb-1 font-medium">No pudimos cargar los restaurantes</p>
              <p className="text-xs sm:text-sm text-muted-foreground/60 mb-4 max-w-md mx-auto">Error de conexión con el servidor. Verifica tu conexión a internet e intenta de nuevo.</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Reintentar
              </Button>
            </div>
          ) : displayRestaurantes.length === 0 ? (
            <div className="text-center py-14 sm:py-16 rounded-2xl border-2 border-dashed border-border/60 bg-card/50 max-w-5xl mx-auto">
              <Search className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-4 text-muted-foreground/20" />
              <p className="text-sm sm:text-base text-muted-foreground font-medium">No se encontraron restaurantes</p>
              {search ? (
                <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-center">
                  <Button variant="outline" size="sm" onClick={handleClearSearch}>
                    Ver todos
                  </Button>
                </div>
              ) : (
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground/60">Intenta con otro término de búsqueda</p>
              )}
            </div>
          ) : shouldCenterGrid ? (
            /* Grid centrado para 1-2 elementos */
            <div className="flex flex-wrap justify-center gap-6 max-w-5xl mx-auto">
              {displayRestaurantes.map((r) => (
                <div key={r.id} className="w-full sm:w-[calc(50%-12px)] max-w-sm">
                  <RestaurantCard restaurante={r} />
                </div>
              ))}
            </div>
          ) : (
            /* Grid normal para 3+ elementos */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {displayRestaurantes.map((r) => (
                <RestaurantCard key={r.id} restaurante={r} />
              ))}
            </div>
          )}

          {/* CTA para no autenticados */}
          {!loading && displayRestaurantes.length > 0 && !isAuthenticated && (
            <div className="mt-12 sm:mt-14 text-center">
              <div className="inline-block p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10 shadow-md">
                <h3 className="font-display text-lg sm:text-xl font-bold mb-2">¿Quieres reservar una mesa?</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-5 max-w-sm">
                  Crea tu cuenta gratis y reserva en los mejores restaurantes de tu ciudad.
                </p>
                <Button onClick={() => navigate("/register")} className="rounded-full px-8 bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg">
                  Crear cuenta gratis
                </Button>
              </div>
            </div>
          )}

          <StructuredData
            data={{
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "TableBit",
              url: "https://tablebit.com",
              description: "Reserva de mesas en restaurantes",
              potentialAction: {
                "@type": "SearchAction",
                target: `https://tablebit.com/?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }}
          />

          {!loading && displayRestaurantes.length > 0 && (
            <StructuredData
              data={{
                "@context": "https://schema.org",
                "@type": "ItemList",
                name: search ? `Resultados para "${search}"` : "Restaurantes populares",
                itemListElement: displayRestaurantes.slice(0, 6).map((r, i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  item: {
                    "@type": "Restaurant",
                    name: r.nombre,
                    address: {
                      "@type": "PostalAddress",
                      addressLocality: r.ciudad,
                      streetAddress: r.direccion,
                    },
                    telephone: r.telefono,
                    servesCuisine: r.tipo_comida,
                  },
                })),
              }}
            />
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default Home;
