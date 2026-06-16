import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useRestaurante } from "@/context/RestauranteContext";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { prefetchDashboardData, setupIdlePrefetch } from "@/lib/prefetch";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import {
  LayoutDashboard, UtensilsCrossed, CalendarDays, List, LogOut, ChevronLeft,
  Menu, X, ChevronDown, BarChart3, Table2, Store, Clock, Palette, ImageIcon, User, Settings, Sun, Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { getImageUrl, handleImageError, PLACEHOLDER_LOGO, PLACEHOLDER_AVATAR } from "@/lib/image";
import { getRestaurantBranding, brandColorWithAlpha } from "@/lib/branding";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Reservas", icon: List, path: "/dashboard/reservas" },
  { label: "Calendario", icon: CalendarDays, path: "/dashboard/calendario" },
  { label: "Mesas", icon: UtensilsCrossed, path: "/dashboard/mesas" },
  { label: "Mi restaurante", icon: Store, path: "/dashboard/mi-restaurante" },
  { label: "Analytics", icon: BarChart3, path: "/dashboard/analytics" },
];

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const { selectedRestauranteId, setSelectedRestauranteId, misRestaurantes, restauranteActual } = useRestaurante();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const queryClient = useQueryClient();
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return setupIdlePrefetch(queryClient, selectedRestauranteId);
  }, [selectedRestauranteId]);

  const handleNavHover = (path: string) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      const routeImports: Record<string, () => Promise<any>> = {
        "/dashboard/analytics": () => import("@/pages/dashboard/Analytics"),
        "/dashboard/reservas": () => import("@/pages/dashboard/ListadoReservas"),
        "/dashboard/mesas": () => import("@/pages/dashboard/GestionMesas"),
        "/dashboard/calendario": () => import("@/pages/dashboard/CalendarioReservas"),
        "/dashboard/horarios": () => import("@/pages/dashboard/HorariosPage"),
        "/dashboard/branding": () => import("@/pages/dashboard/BrandingPage"),
        "/dashboard/mapa-mesas": () => import("@/pages/dashboard/TableMapPage"),
        "/dashboard/restaurantes": () => import("@/pages/dashboard/MisRestaurantesPage"),
      };
      const imp = routeImports[path];
      if (imp) imp().catch(() => {});
    }, 80);
  };

  const handleLogout = () => { logout(); navigate("/"); };
  const { theme, setTheme } = useTheme();
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const branding = getRestaurantBranding(restauranteActual);
  const isActive = (path: string) => location.pathname === path;

  const SidebarContent = () => (
    <>
      <div className="p-5">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <UtensilsCrossed className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">TableBit</span>
        </Link>
        {restauranteActual && misRestaurantes.length > 1 ? (
          <div className="mt-4">
            <Select value={String(selectedRestauranteId)} onValueChange={(v) => setSelectedRestauranteId(Number(v))}>
              <SelectTrigger className="w-full h-11 gap-2.5 px-3 rounded-xl bg-sidebar-accent/30 border-sidebar-border/40 text-sidebar-foreground hover:bg-sidebar-accent/50 hover:border-sidebar-border transition-all duration-200 shadow-sm">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="h-7 w-7 rounded-lg bg-sidebar-accent flex items-center justify-center flex-shrink-0 overflow-hidden ring-1 ring-sidebar-border/50">
                    {restauranteActual.logo ? (
                      <img src={getImageUrl(restauranteActual.logo) || PLACEHOLDER_LOGO} alt="" className="h-full w-full object-contain" />
                    ) : (
                      <span className="text-xs font-bold text-primary">{restauranteActual.nombre?.[0]}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-semibold text-sidebar-foreground truncate leading-tight">{restauranteActual.nombre}</p>
                    <p className="text-[11px] text-sidebar-foreground/50 font-medium">Activo</p>
                  </div>
                </div>
              </SelectTrigger>
              <SelectContent className="min-w-[200px] rounded-xl border-sidebar-border/50 shadow-xl">
                {misRestaurantes.map((r) => (
                  <SelectItem key={r.id} value={String(r.id)} className="py-2.5 px-3 rounded-lg cursor-pointer data-[highlighted]:bg-sidebar-accent/50 transition-colors">
                    <span className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {r.logo ? (
                          <img src={getImageUrl(r.logo) || PLACEHOLDER_LOGO} alt="" className="h-full w-full object-contain" />
                        ) : (
                          <span className="text-[10px] font-bold text-muted-foreground">{r.nombre?.[0]}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{r.nombre}</p>
                        {r.id === selectedRestauranteId && (
                          <p className="text-[11px] font-medium text-primary">Activo ahora</p>
                        )}
                      </div>
                      {r.id === selectedRestauranteId && (
                        <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                      )}
                    </span>
                  </SelectItem>
                ))}
                <SelectItem value="__manage" className="py-2.5 px-3 rounded-lg border-t border-sidebar-border/30 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); navigate("/dashboard/restaurantes"); }}>
                  <span className="flex items-center gap-2 text-sm">
                    <Store className="h-4 w-4" />
                    Administrar restaurantes
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : restauranteActual ? (
          <div className="mt-4 flex items-center gap-2.5 px-3 py-2 rounded-xl bg-sidebar-accent/20 border border-sidebar-border/30">
            <div className="h-7 w-7 rounded-lg bg-sidebar-accent flex items-center justify-center flex-shrink-0 overflow-hidden ring-1 ring-sidebar-border/50">
              {restauranteActual.logo ? (
                <img src={getImageUrl(restauranteActual.logo) || PLACEHOLDER_LOGO} alt="" className="h-full w-full object-contain" />
              ) : (
                <span className="text-xs font-bold text-primary">{restauranteActual.nombre?.[0]}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate leading-tight">{restauranteActual.nombre}</p>
              <p className="text-[11px] text-sidebar-foreground/50 font-medium">Activo</p>
            </div>
          </div>
        ) : null}
      </div>
      <nav className="flex-1 px-3 space-y-0.5" aria-label="Navegación del dashboard">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              onMouseEnter={() => handleNavHover(item.path)}
              onTouchStart={() => handleNavHover(item.path)}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium motion-safe:transition-all motion-safe:duration-200 ${
                active
                  ? "bg-sidebar-accent text-sidebar-foreground shadow-sm"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 motion-safe:hover:transform-gpu"
              }`}
            >
              <item.icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border mt-auto">
        <div className="flex items-center gap-2 mb-3 px-1">
          <div className="h-7 w-7 rounded-full bg-muted overflow-hidden flex items-center justify-center flex-shrink-0">
            {user?.avatar ? (
              <img src={getImageUrl(user.avatar) || PLACEHOLDER_AVATAR} alt="" className="h-full w-full object-cover"
                onError={(e) => { const t = e.target as HTMLImageElement; t.style.display = "none"; (t.nextElementSibling as HTMLElement)?.classList.remove("hidden"); }} />
            ) : null}
            <span className={`text-xs font-semibold text-sidebar-foreground ${user?.avatar ? "hidden" : ""}`}>
              {user?.name?.charAt(0)?.toUpperCase() || "?"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground truncate">{user?.name}</p>
            <p className="text-[10px] text-sidebar-foreground/40 truncate">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-1.5 justify-between">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-sidebar-foreground/50 hover:text-sidebar-foreground active:scale-[0.98]" onClick={() => navigate("/perfil")} aria-label="Perfil">
            <User className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-sidebar-foreground/50 hover:text-sidebar-foreground active:scale-[0.98]" onClick={() => {
            const slug = restauranteActual?.slug;
            if (slug) navigate(`/restaurante/${slug}`);
            else if (restauranteActual?.id) navigate(`/restaurantes/${restauranteActual.id}`);
            else navigate("/");
          }} aria-label="Ver sitio público">
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-sidebar-foreground/50 hover:text-sidebar-foreground active:scale-[0.98]" onClick={toggleTheme} aria-label="Cambiar tema">
            {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-sidebar-foreground/50 hover:text-destructive active:scale-[0.98]" onClick={handleLogout} aria-label="Cerrar sesión">
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-60 xl:w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-elevated z-30">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col animate-slide-in overflow-y-auto overscroll-contain" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
            <div className="flex justify-end p-3 pt-[env(safe-area-inset-top,12px)]">
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-sidebar-accent/50 text-sidebar-foreground/60 active:scale-[0.95] transition-transform" aria-label="Cerrar menú">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 h-14 lg:h-16 border-b border-border/50 bg-background/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 gap-4">
          <div className="flex items-center gap-3">
<button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-muted transition-colors active:scale-[0.95]" aria-label="Abrir menú">
          <Menu className="h-5 w-5 text-foreground" aria-hidden="true" />
        </button>
            <div className="flex items-center gap-3">
              <h2 className="font-display text-sm font-semibold hidden sm:block">
                {navItems.find((i) => isActive(i.path))?.label || "Dashboard"}
              </h2>
              {restauranteActual && (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium animate-fade-in"
                  style={{ backgroundColor: brandColorWithAlpha(branding.primary_color, 0.05), borderColor: brandColorWithAlpha(branding.primary_color, 0.1), color: brandColorWithAlpha(branding.primary_color, 0.8) }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: branding.primary_color }} />
                  {restauranteActual.nombre}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-border">
              <div className="h-7 w-7 rounded-full bg-muted overflow-hidden flex items-center justify-center">
                {user?.avatar ? (
                  <img src={getImageUrl(user.avatar) || PLACEHOLDER_AVATAR} alt="" className="h-full w-full object-cover"
                    onError={(e) => handleImageError(e, PLACEHOLDER_AVATAR)} />
                ) : (
                  <span className="text-xs font-semibold text-primary">{user?.name?.charAt(0)?.toUpperCase() || "?"}</span>
                )}
              </div>
              <span className="text-sm font-medium text-foreground hidden md:block">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main id="main-content" className="flex-1 p-4 lg:p-6 xl:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
