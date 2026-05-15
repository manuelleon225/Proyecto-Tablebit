import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Lock, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import AuthLayout from "@/layouts/AuthLayout";

const loginSchema = z.object({
  email: z.string().email("Ingresa un email válido"),
  password: z.string().min(1, "La contraseña es requerida"),
});
type LoginForm = z.infer<typeof loginSchema>;

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  useSEO({ title: "TableBit - Iniciar sesión", description: "Accede a tu cuenta de TableBit." });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    const result = await login(data);
    if (result.success) {
      toast({ title: "¡Bienvenido!", description: "Has iniciado sesión correctamente." });
      navigate(result.user?.role === "cliente" ? "/" : "/dashboard");
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error || "Credenciales inválidas" });
    }
  };

  return (
    <AuthLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 border border-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
            <Sparkles className="h-3 w-3" /> Inicia sesión
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Bienvenido de vuelta</h1>
          <p className="text-sm text-muted-foreground mt-2">Ingresa tus credenciales para continuar</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
              <Input id="password" type="password" {...register("password")} placeholder="••••••••"
                className={`pl-10 h-11 bg-card/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all ${errors.password ? "border-destructive" : ""}`}
                autoComplete="current-password" />
            </div>
            {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full h-11 shadow-lg shadow-primary/20" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Ingresando...</> : "Iniciar sesión"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="text-primary font-semibold hover:underline transition-all">Regístrate</Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
};

export default Login;
