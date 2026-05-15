import { Link } from "react-router-dom";
import { UtensilsCrossed, ArrowLeft } from "lucide-react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/50">
    <header className="sticky top-0 z-50 border-b border-border/30 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 sm:h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/30 transition-all">
            <UtensilsCrossed className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg sm:text-xl font-bold tracking-tight">TableBit</span>
        </Link>
        <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Volver al inicio
        </Link>
      </div>
    </header>
    <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
      {children}
    </main>
  </div>
);

export default AuthLayout;
