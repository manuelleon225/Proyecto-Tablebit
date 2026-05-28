import { Suspense, lazy, useEffect, useState, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Outlet, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { RestauranteProvider } from "@/context/RestauranteContext";
import { BrandingProvider } from "@/context/BrandingContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import Loader from "@/components/Loader";
import OfflineBanner from "@/components/system/OfflineBanner";
import { getPersistedQuery, setPersistedQuery, PERSISTED_QUERIES } from "@/lib/queryPersistence";
import { Download } from "lucide-react";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Profile = lazy(() => import("./pages/Profile"));
const RestauranteDetalle = lazy(() => import("./pages/RestauranteDetalle"));
const MisReservas = lazy(() => import("./pages/MisReservas"));
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const GestionMesas = lazy(() => import("./pages/dashboard/GestionMesas"));
const CalendarioReservas = lazy(() => import("./pages/dashboard/CalendarioReservas"));
const ListadoReservas = lazy(() => import("./pages/dashboard/ListadoReservas"));
const Analytics = lazy(() => import("./pages/dashboard/Analytics"));
const TableMapPage = lazy(() => import("./pages/dashboard/TableMapPage"));
const MisRestaurantesPage = lazy(() => import("./pages/dashboard/MisRestaurantesPage"));
const HorariosPage = lazy(() => import("./pages/dashboard/HorariosPage"));
const BrandingPage = lazy(() => import("./pages/dashboard/BrandingPage"));
const RestaurantMediaSettings = lazy(() => import("./pages/dashboard/RestaurantMediaSettings"));
const MiRestaurantePage = lazy(() => import("./pages/dashboard/MiRestaurantePage"));
const AuditDashboard = lazy(() => import("./pages/admin/AuditDashboard"));
const AlertsDashboard = lazy(() => import("./pages/admin/AlertsDashboard"));
const LiveStreamDashboard = lazy(() => import("./pages/admin/LiveStreamDashboard"));
const AnalyticsDashboard = lazy(() => import("./pages/admin/AnalyticsDashboard"));
const ObservabilityHub = lazy(() => import("./pages/admin/ObservabilityHub"));
const RestaurantesPage = lazy(() => import("./pages/RestaurantesPage"));
const RestaurantPublicPage = lazy(() => import("./pages/public/RestaurantPublicPage"));
const OnboardingRestaurante = lazy(() => import("./pages/OnboardingRestaurante"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    },
  },
});

PERSISTED_QUERIES.forEach((keyPrefix) => {
  const cached = getPersistedQuery([keyPrefix]);
  if (cached) {
    queryClient.setQueryData([keyPrefix], cached);
  }
});

const DashboardLayoutLazy = lazy(() => import("@/layouts/DashboardLayout"));

let deferredPrompt: Event | null = null;

const PwaHandler = () => {
  useEffect(() => {
    const handler = (e: Event) => {
      deferredPrompt = e;
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);
  return null;
};

const InstallPwaButton = () => {
  const [available, setAvailable] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (deferredPrompt) { setAvailable(true); return; }
    const check = () => { if (deferredPrompt) setAvailable(true); };
    const iv = setInterval(check, 2000);
    return () => clearInterval(iv);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    (deferredPrompt as any).prompt();
    const result = await (deferredPrompt as any).userChoice;
    deferredPrompt = null;
    setAvailable(false);
    setInstalling(false);
  }, []);

  if (!available) return null;

  return (
    <button
      onClick={handleInstall}
      disabled={installing}
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground shadow-lg hover:shadow-primary/30 transition-all active:scale-95 text-sm font-medium"
    >
      <Download className="h-4 w-4" />
      {installing ? "Instalando..." : "Instalar app"}
    </button>
  );
};

const DashboardGuard = () => {
  const location = useLocation();
  return (
  <ProtectedRoute requiredRole={["admin", "admin_restaurante", "superadmin"]}>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader text="Cargando..." /></div>}>
      <DashboardLayoutLazy>
        <div key={location.pathname} className="animate-fade-in">
          <Outlet />
        </div>
      </DashboardLayoutLazy>
      </Suspense>
  </ProtectedRoute>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <RestauranteProvider>
      <PwaHandler />
      <InstallPwaButton />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <OfflineBanner />
        <BrandingProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <a href="#main-content" className="skip-link">Saltar al contenido principal</a>
          <ErrorBoundary>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader text="Cargando..." /></div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/buscar-restaurantes" element={<Home />} />
                <Route path="/restaurantes" element={<RestaurantesPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/restaurantes/:id" element={<RestauranteDetalle />} />
                <Route path="/restaurante/:slug" element={<RestaurantPublicPage />} />
                <Route
                  path="/onboarding/restaurante"
                  element={
                    <ProtectedRoute requiredRole={["admin", "admin_restaurante", "superadmin"]}>
                      <OnboardingRestaurante />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mis-reservas"
                  element={
                    <ProtectedRoute>
                      <MisReservas />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/perfil"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route element={<DashboardGuard />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/dashboard/mesas" element={<GestionMesas />} />
                  <Route path="/dashboard/calendario" element={<CalendarioReservas />} />
                  <Route path="/dashboard/reservas" element={<ListadoReservas />} />
                  <Route path="/dashboard/analytics" element={<Analytics />} />
                  <Route path="/dashboard/mapa-mesas" element={<TableMapPage />} />
                  <Route path="/dashboard/restaurantes" element={<MisRestaurantesPage />} />
                  <Route path="/dashboard/horarios" element={<HorariosPage />} />
                  <Route path="/dashboard/branding" element={<BrandingPage />} />
                  <Route path="/dashboard/media" element={<RestaurantMediaSettings />} />
                  <Route path="/dashboard/mi-restaurante" element={<MiRestaurantePage />} />
                  <Route path="/dashboard/auditoria" element={
                    <ProtectedRoute requiredRole={["superadmin"]}>
                      <AuditDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/alertas" element={
                    <ProtectedRoute requiredRole={["superadmin"]}>
                      <AlertsDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/tiempo-real" element={
                    <ProtectedRoute requiredRole={["superadmin"]}>
                      <LiveStreamDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/analiticas" element={
                    <ProtectedRoute requiredRole={["superadmin"]}>
                      <AnalyticsDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard/observabilidad" element={
                    <ProtectedRoute requiredRole={["superadmin"]}>
                      <ObservabilityHub />
                    </ProtectedRoute>
                  } />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
        </BrandingProvider>
      </TooltipProvider>
      </RestauranteProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
