import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UtensilsCrossed, Loader2, Mail, Lock, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [role, setRole] = useState<"cliente" | "admin">("cliente");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await register({ name, email, password, role });
    setLoading(false);
    if (result.success) {
      toast({ title: "¡Cuenta creada!", description: "Tu registro ha sido exitoso." });
      navigate("/");
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error || "No se pudo completar el registro" });
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary to-primary/80 items-center justify-center p-12">
        <div className="text-center max-w-md">
          <div className="mx-auto h-20 w-20 rounded-2xl bg-primary-foreground/10 backdrop-blur-sm flex items-center justify-center mb-8 shadow-lg">
            <UtensilsCrossed className="h-10 w-10 text-primary-foreground" />
          </div>
          <h2 className="font-display text-4xl font-bold text-primary-foreground mb-3">TableBit</h2>
          <p className="text-lg text-primary-foreground/70 leading-relaxed">
            Únete y comienza a reservar en los mejores restaurantes.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
              <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center">
                <UtensilsCrossed className="h-7 w-7 text-primary-foreground" />
              </div>
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Crear cuenta</h1>
            <p className="text-sm text-muted-foreground mt-2">Completa tus datos para registrarte</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Tu nombre"
                  className="pl-10"
                  autoComplete="name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="tu@email.com"
                  className="pl-10"
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Mínimo 6 caracteres"
                  className="pl-10"
                  autoComplete="new-password"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">Confirmar contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="passwordConfirm"
                  type="password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required
                  placeholder="Repite tu contraseña"
                  className="pl-10"
                  autoComplete="new-password"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tipo de cuenta</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("cliente")}
                  className={`py-2.5 rounded-lg border text-sm font-medium transition-all ${
                    role === "cliente"
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  Cliente
                </button>
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`py-2.5 rounded-lg border text-sm font-medium transition-all ${
                    role === "admin"
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  Administrador
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Crear cuenta"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline transition-all">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
