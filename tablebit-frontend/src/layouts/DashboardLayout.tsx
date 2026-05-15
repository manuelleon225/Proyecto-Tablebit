import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useRestaurante } from "@/context/RestauranteContext";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import {
  LayoutDashboard, UtensilsCrossed, CalendarDays, List, LogOut, ChevronLeft,
  Menu, X, ChevronDown, BarChart3, Table2, Store, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Mesas", icon: UtensilsCrossed, path: "/dashboard/mesas" },
  { label: "Mapa", icon: Table2, path: "/dashboard/mapa-mesas" },
  { label: "Calendario", icon: CalendarDays, path: "/dashboard/calendario" },
  { label: "Reservas", icon: List, path: "/dashboard/reservas" },
  { label: "Analytics", icon: BarChart3, path: "/dashboard/analytics" },
  { label: "Horarios", icon: Clock, path: "/dashboard/horarios" },
  { label: "Mis Restaurantes", icon: Store, path: "/dashboard/restaurantes" },
];

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const { selectedRestauranteId, setSelectedRestauranteId, misRestaurantes, restauranteActual } = useRestaurante();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate("/"); };

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
        {restauranteActual && (
          <div className="mt-4">
            {misRestaurantes.length > 1 ? (
              <Select value={String(selectedRestauranteId)} onValueChange={(v) => setSelectedRestauranteId(Number(v))}>
                <SelectTrigger className="w-full h-8 text-xs bg-sidebar-accent/50 border-sidebar-border text-sidebar-foreground/80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {misRestaurantes.map((r: { id: number; nombre: string }) => (
                    <SelectItem key={r.id} value={String(r.id)} className="text-xs">{r.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-xs text-sidebar-foreground/50 truncate px-1">{restauranteActual.nombre}</p>
            )}
          </div>
        )}
      </div>
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-sidebar-accent text-sidebar-foreground shadow-sm"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border mt-auto">
        <div className="flex items-center gap-2 mb-3 px-1">
          <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-sidebar-foreground">
            {user?.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground truncate">{user?.name}</p>
            <p className="text-[10px] text-sidebar-foreground/40 truncate">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          <Button variant="ghost" size="sm" className="text-sidebar-foreground/50 hover:text-sidebar-foreground h-8 text-xs flex-1" onClick={() => navigate("/")}>
            <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Sitio
          </Button>
          <Button variant="ghost" size="sm" className="text-sidebar-foreground/50 hover:text-destructive h-8 text-xs" onClick={handleLogout}>
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
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col animate-slide-in">
            <div className="flex justify-end p-3">
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-sidebar-accent/50 text-sidebar-foreground/60">
                <X className="h-5 w-5" />
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
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-muted transition-colors">
              <Menu className="h-5 w-5 text-foreground" />
            </button>
            <div>
              <h2 className="font-display text-sm font-semibold hidden sm:block">
                {navItems.find((i) => isActive(i.path))?.label || "Dashboard"}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-border">
              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-semibold text-primary">{user?.name?.charAt(0)?.toUpperCase() || "?"}</span>
              </div>
              <span className="text-sm font-medium text-foreground hidden md:block">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 xl:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
