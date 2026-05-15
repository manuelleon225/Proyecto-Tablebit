import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UtensilsCrossed, Loader2, Mail, Lock, User as UserIcon, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";

const registerSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(255),
  email: z.string().email("Ingresa un email válido"),
  password: z.string().min(8, "Mínimo 8 caracteres").regex(/[A-Z]/, "Debe contener una mayúscula").regex(/[a-z]/, "Debe contener una minúscula").regex(/[^a-zA-Z0-9]/, "Debe contener un carácter especial"),
  passwordConfirm: z.string().min(1, "Confirma tu contraseña"),
}).refine((data) => data.password === data.passwordConfirm, { message: "Las contraseñas no coinciden", path: ["passwordConfirm"] });
type RegisterForm = z.infer<typeof registerSchema>;

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useSEO({ title: "TableBit - Crear cuenta", description: "Regístrate en TableBit y empieza a reservar." });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    const result = await registerUser({ name: data.name, email: data.email, password: data.password });
    if (result.success) {
      const role = result.user?.role || "cliente";
      toast({ title: "¡Bienvenido!", description: "Tu cuenta ha sido creada correctamente." });
      navigate(role === "cliente" ? "/" : "/dashboard");
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error || "No se pudo completar el registro" });
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-background via-background to-muted/50">
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent" />
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-secondary/5 blur-3xl" />
        <div className="text-center max-w-md relative z-10">
          <div className="mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-8 shadow-elevated shadow-primary/20">
            <UtensilsCrossed className="h-10 w-10 text-primary-foreground" />
          </div>
          <h2 className="font-display text-4xl font-bold mb-3">TableBit</h2>
          <p className="text-lg text-muted-foreground/80 leading-relaxed">
            Únete y comienza a reservar en los mejores restaurantes.
          </p>
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Reserva tu mesa en segundos</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                <UtensilsCrossed className="h-7 w-7 text-primary-foreground" />
              </div>
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Crear cuenta</h1>
            <p className="text-sm text-muted-foreground mt-2">Completa tus datos para registrarte</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <div className="relative group">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input id="name" {...register("name")} placeholder="Tu nombre"
                  className={`pl-10 h-11 bg-card/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all ${errors.name ? "border-destructive" : ""}`}
                  autoComplete="name" />
              </div>
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input id="email" type="email" {...register("email")} placeholder="tu@email.com"
                  className={`pl-10 h-11 bg-card/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all ${errors.email ? "border-destructive" : ""}`}
                  autoComplete="email" />
              </div>
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input id="password" type="password" {...register("password")} placeholder="Mínimo 8 caracteres"
                  className={`pl-10 h-11 bg-card/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all ${errors.password ? "border-destructive" : ""}`}
                  autoComplete="new-password" />
              </div>
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">Confirmar contraseña</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input id="passwordConfirm" type="password" {...register("passwordConfirm")} placeholder="Repite tu contraseña"
                  className={`pl-10 h-11 bg-card/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all ${errors.passwordConfirm ? "border-destructive" : ""}`}
                  autoComplete="new-password" />
              </div>
              {errors.passwordConfirm && <p className="text-xs text-destructive mt-1">{errors.passwordConfirm.message}</p>}
            </div>
            <Button type="submit" className="w-full h-11 shadow-lg shadow-primary/20" disabled={isSubmitting}>
              {isSubmitting ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Registrando...</>) : "Crear cuenta"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline transition-all">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
