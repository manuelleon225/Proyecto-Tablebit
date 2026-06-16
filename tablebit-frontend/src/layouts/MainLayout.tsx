import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, UtensilsCrossed, Menu, X, User, ChevronRight, Bell, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { getImageUrl, handleImageError, PLACEHOLDER_AVATAR } from "@/lib/image";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => { logout(); navigate("/"); setMobileOpen(false); };
  const { theme, setTheme } = useTheme();
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const getUserInitials = () => {
    if (!user?.name) return "?";
    return user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const isAdmin = ["admin", "admin_restaurante", "superadmin"].includes(user?.role || "");

  const navLinks = isAuthenticated && isAdmin
    ? [
        { to: "/dashboard", label: "Dashboard" },
        { to: "/dashboard/reservas", label: "Reservas" },
        { to: "/dashboard/mesas", label: "Mesas" },
      ]
    : [
        { to: "/restaurantes", label: "Restaurantes" },
        ...(isAuthenticated ? [{ to: "/mis-reservas", label: "Mis Reservas" }] : []),
      ];

  return (
    <div className="min-h-screen flex flex-col bg-background" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-border/50 bg-background/80 backdrop-blur-xl shadow-sm"
            : "border-b border-transparent bg-background/50 backdrop-blur-md"
        }`}
      >
        <div className="container flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/30 transition-all duration-300">
              <UtensilsCrossed className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg sm:text-xl font-bold tracking-tight">TableBit</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-1.5">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" aria-label="Cambiar tema">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            {isAuthenticated ? (
              <div className="flex items-center gap-1.5">
                <Button variant="ghost" size="sm" onClick={() => navigate("/perfil")} className="text-muted-foreground">
                  <User className="h-4 w-4 mr-1.5" /> Perfil
                </Button>
                <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-muted/50 border border-border/50">
                  <div className="h-7 w-7 rounded-full bg-muted overflow-hidden flex items-center justify-center">
                    {user?.avatar ? (
                      <img src={getImageUrl(user.avatar) || PLACEHOLDER_AVATAR} alt="" className="h-full w-full object-cover"
                        onError={(e) => handleImageError(e, PLACEHOLDER_AVATAR)} />
                    ) : (
                      <span className="text-xs font-semibold text-primary">{getUserInitials()}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium max-w-28 truncate">{user?.name}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>Iniciar sesión</Button>
                <Button size="sm" onClick={() => navigate("/register")} className="shadow-lg shadow-primary/20">Registrarse</Button>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={toggleTheme} className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" aria-label="Cambiar tema">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl animate-fade-in">
            <div className="container py-4 space-y-1 px-4">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to}
                  className="flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                  onClick={() => setMobileOpen(false)}>
                  {link.label} <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
              <div className="pt-3 mt-3 border-t border-border/50">
                {isAuthenticated ? (
                  <div className="space-y-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-muted overflow-hidden flex items-center justify-center">
                        {user?.avatar ? (
                          <img src={getImageUrl(user.avatar) || PLACEHOLDER_AVATAR} alt="" className="h-full w-full object-cover"
                            onError={(e) => handleImageError(e, PLACEHOLDER_AVATAR)} />
                        ) : (
                          <span className="text-sm font-semibold text-primary">{getUserInitials()}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user?.name}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" /> Cerrar sesión
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2 px-4">
                    <Button variant="outline" className="w-full" onClick={() => { navigate("/login"); setMobileOpen(false); }}>Iniciar sesión</Button>
                    <Button className="w-full" onClick={() => { navigate("/register"); setMobileOpen(false); }}>Registrarse</Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1" role="main">{children}</main>

      <footer className="border-t border-border/50 bg-muted/30">
        <div className="container py-8 sm:py-10 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <UtensilsCrossed className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="font-display text-sm font-bold">TableBit</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground text-center">
              &copy; {new Date().getFullYear()} TableBit. Todos los derechos reservados.
            </p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Términos</a>
              <a href="#" className="hover:text-foreground transition-colors">Privacidad</a>
              <a href="#" className="hover:text-foreground transition-colors">Contacto</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
