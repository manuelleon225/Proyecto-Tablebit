import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { RestauranteProvider } from "@/context/RestauranteContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import Loader from "@/components/Loader";

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
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ErrorBoundary>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader text="Cargando..." /></div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/buscar-restaurantes" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/restaurantes/:id" element={<RestauranteDetalle />} />
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
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute requiredRole={["admin", "admin_restaurante", "superadmin"]}>
                      <RestauranteProvider><Dashboard /></RestauranteProvider>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/mesas"
                  element={
                    <ProtectedRoute requiredRole={["admin", "admin_restaurante", "superadmin"]}>
                      <RestauranteProvider><GestionMesas /></RestauranteProvider>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/calendario"
                  element={
                    <ProtectedRoute requiredRole={["admin", "admin_restaurante", "superadmin"]}>
                      <RestauranteProvider><CalendarioReservas /></RestauranteProvider>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/reservas"
                  element={
                    <ProtectedRoute requiredRole={["admin", "admin_restaurante", "superadmin"]}>
                      <RestauranteProvider><ListadoReservas /></RestauranteProvider>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/analytics"
                  element={
                    <ProtectedRoute requiredRole={["admin", "admin_restaurante", "superadmin"]}>
                      <RestauranteProvider><Analytics /></RestauranteProvider>
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
