import type { QueryClient } from "@tanstack/react-query";
import { restauranteService } from "@/services/restauranteService";

const prefetched = new Set<string>();

function prefetchRoute(path: string): void {
  if (prefetched.has(path)) return;
  prefetched.add(path);

  const routes: Record<string, () => Promise<any>> = {
    "/dashboard": () => import("@/pages/dashboard/Dashboard"),
    "/dashboard/mesas": () => import("@/pages/dashboard/GestionMesas"),
    "/dashboard/calendario": () => import("@/pages/dashboard/CalendarioReservas"),
    "/dashboard/reservas": () => import("@/pages/dashboard/ListadoReservas"),
    "/dashboard/analytics": () => import("@/pages/dashboard/Analytics"),
    "/dashboard/mapa-mesas": () => import("@/pages/dashboard/TableMapPage"),
    "/dashboard/restaurantes": () => import("@/pages/dashboard/MisRestaurantesPage"),
    "/dashboard/horarios": () => import("@/pages/dashboard/HorariosPage"),
    "/dashboard/branding": () => import("@/pages/dashboard/BrandingPage"),
  };

  const importer = routes[path];
  if (importer) importer().catch(() => {});
}

function prefetchQuery(qc: QueryClient, key: string[], fetcher: () => Promise<any>, stale = 60000): void {
  const flat = key.join(":");
  if (prefetched.has(flat) || qc.getQueryData(key)) return;
  prefetched.add(flat);
  qc.prefetchQuery({ queryKey: key, queryFn: fetcher, staleTime: stale }).catch(() => {});
}

export function prefetchDashboardData(qc: QueryClient, restauranteId: number | null): void {
  if (!restauranteId) return;

  prefetchRoute("/dashboard/analytics");
  prefetchRoute("/dashboard/reservas");

  prefetchQuery(qc, ["dashboard-analytics", restauranteId],
    () => restauranteService.getDashboard(restauranteId!).then((r) => r.data));

  prefetchQuery(qc, ["reservas-admin", restauranteId],
    () => restauranteService.getReservas({ restaurante_id: restauranteId }).then((r) => r.data));

  prefetchQuery(qc, ["mesas", restauranteId],
    () => restauranteService.getMesasRestaurante(restauranteId!).then((r) => r.data));
}

export function setupIdlePrefetch(qc: QueryClient, restauranteId: number | null): () => void {
  const cb = () => {
    if (restauranteId) {
      prefetchDashboardData(qc, restauranteId);
    }
  };

  if ("requestIdleCallback" in window) {
    const id = requestIdleCallback(cb, { timeout: 3000 });
    return () => cancelIdleCallback(id);
  }

  const id = setTimeout(cb, 2000);
  return () => clearTimeout(id);
}
