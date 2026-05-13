import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  CalendarDays, 
  List, 
  LogOut, 
  ChevronLeft 
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Mesas", icon: UtensilsCrossed, path: "/dashboard/mesas" },
  { label: "Calendario", icon: CalendarDays, path: "/dashboard/calendario" },
  { label: "Reservas", icon: List, path: "/dashboard/reservas" },
];

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <UtensilsCrossed className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">TableBit</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/60 mb-3 truncate">{user?.name}</p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="text-sidebar-foreground/70 hover:text-sidebar-foreground" onClick={() => navigate("/")}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Volver
            </Button>
            <Button variant="ghost" size="sm" className="text-sidebar-foreground/70 hover:text-sidebar-foreground" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-sidebar text-sidebar-foreground border-b border-sidebar-border flex items-center px-3 gap-2">
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="h-7 w-7 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <UtensilsCrossed className="h-3.5 w-3.5 text-sidebar-primary-foreground" />
          </div>
          <span className="font-display text-base font-bold hidden xs:inline">TableBit</span>
        </Link>
        <nav className="flex-1 flex gap-0.5 overflow-x-auto scrollbar-hide justify-end">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/60 hover:text-sidebar-foreground"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <main className="flex-1 lg:pt-0 pt-14">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
