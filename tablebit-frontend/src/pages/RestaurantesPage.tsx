import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { restauranteService } from "@/services/restauranteService";
import MainLayout from "@/layouts/MainLayout";
import RestaurantCard from "@/components/RestaurantCard";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";

const tipos = ["Todos", "Japonesa", "Italiana", "Mexicana", "Internacional", "Española"];

const RestaurantesPage = () => {
  const [searchParams] = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const [search, setSearch] = useState(initialQ);
  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [tipoFilter, setTipoFilter] = useState("Todos");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    if (q) { setSearch(q); setSearchQuery(q); }
  }, [searchParams]);

  useSEO({ title: "TableBit - Restaurantes", description: "Encuentra los mejores restaurantes cerca de ti." });

  const { data: restaurantes = [], isLoading, error } = useQuery({
    queryKey: ['restaurantes-lista', searchQuery],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (searchQuery) params.nombre = searchQuery;
      if (tipoFilter !== "Todos") params.tipo_comida = tipoFilter;
      const res = Object.keys(params).length ? await restauranteService.buscar(params) : await restauranteService.getAll();
      const data = res.data;
      return Array.isArray(data) ? data : (data.data || []);
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setSearchQuery(search.trim()); };

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">Restaurantes</h1>
          <p className="text-muted-foreground mt-2">Descubre los mejores lugares cerca de ti</p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar restaurantes..." className="pl-9 h-10 bg-card/50 border-border/50" />
            </div>
          </form>
          <div className="flex gap-2 flex-wrap">
            {tipos.map((t) => (
              <button key={t} onClick={() => { setTipoFilter(t); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${tipoFilter === t ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}>{t}</button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden shadow-md">
                <div className="aspect-[16/10] bg-muted animate-pulse" />
                <div className="p-5 space-y-3"><div className="h-5 w-3/4 bg-muted rounded animate-pulse" /><div className="h-4 w-full bg-muted rounded animate-pulse" /><div className="flex gap-3"><div className="h-3 w-20 bg-muted rounded animate-pulse" /><div className="h-3 w-16 bg-muted rounded animate-pulse" /></div></div>
              </div>
            ))}
          </div>
        ) : restaurantes.length === 0 ? (
          <div className="text-center py-20">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/20" />
            <p className="text-lg font-medium text-muted-foreground">No se encontraron restaurantes</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Intenta con otros filtros</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurantes.map((r: any) => <RestaurantCard key={r.id} restaurante={r} />)}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default RestaurantesPage;
