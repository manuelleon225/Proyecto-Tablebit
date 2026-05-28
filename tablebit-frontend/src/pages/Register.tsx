import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Lock, User as UserIcon, Sparkles, UtensilsCrossed, Search, Building2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import AuthLayout from "@/layouts/AuthLayout";
import { cn } from "@/lib/utils";

const registerSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").max(255).trim(),
  email: z.string().email("Ingresa un email válido").max(255).transform((v) => v.toLowerCase().trim()),
  password: z.string().min(8, "Mínimo 8 caracteres").max(128, "Máximo 128 caracteres").regex(/[A-Z]/, "Debe contener una mayúscula").regex(/[a-z]/, "Debe contener una minúscula").regex(/[^a-zA-Z0-9]/, "Debe contener un carácter especial"),
  passwordConfirm: z.string().min(1, "Confirma tu contraseña"),
}).refine((data) => data.password === data.passwordConfirm, { message: "Las contraseñas no coinciden", path: ["passwordConfirm"] });
type RegisterForm = z.infer<typeof registerSchema>;

type RoleOption = "cliente" | "admin_restaurante";

const roles: { value: RoleOption; label: string; desc: string; icon: React.ElementType }[] = [
  { value: "cliente", label: "Quiero reservar restaurantes", desc: "Explora, reserva y gestiona tus reservas en los mejores restaurantes.", icon: Search },
  { value: "admin_restaurante", label: "Quiero administrar un restaurante", desc: "Gestiona tu restaurante, mesas, reservas y analytics en tiempo real.", icon: Building2 },
];

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<RoleOption>("cliente");
  const [step, setStep] = useState<"role" | "form">("role");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  useSEO({ title: "TableBit - Crear cuenta", description: "Regístrate en TableBit." });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    const result = await registerUser({ name: data.name, email: data.email, password: data.password, role: selectedRole });
    if (result.success) {
      toast({ title: "¡Bienvenido!", description: "Tu cuenta ha sido creada correctamente." });
      if (selectedRole === "admin_restaurante") {
        navigate("/onboarding/restaurante");
      } else {
        navigate("/");
      }
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error || "No se pudo completar el registro" });
    }
  };

  return (
    <AuthLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 border border-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
            <Sparkles className="h-3 w-3" /> Crear cuenta
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Únete a TableBit</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {step === "role" ? "Primero, dinos qué tipo de usuario serás" : "Completa tus datos para registrarte"}
          </p>
        </div>

        {step === "role" ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {roles.map((r) => (
              <button key={r.value} onClick={() => { setSelectedRole(r.value); setStep("form"); }}
                className={cn(
                  "w-full text-left p-5 rounded-xl border-2 transition-all duration-200",
                  selectedRole === r.value
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border/50 bg-card hover:border-primary/30 hover:shadow-sm"
                )}>
                <div className="flex items-start gap-4">
                  <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0", selectedRole === r.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                    <r.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-base font-semibold">{r.label}</p>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{r.desc}</p>
                  </div>
                </div>
              </button>
            ))}
            <p className="text-center text-sm text-muted-foreground pt-2">
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="text-primary font-semibold hover:underline">Inicia sesión</Link>
            </p>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-muted/30 border border-border/50">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                {selectedRole === "admin_restaurante" ? <Building2 className="h-5 w-5 text-primary" /> : <Search className="h-5 w-5 text-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{roles.find((r) => r.value === selectedRole)?.label}</p>
              </div>
              <button onClick={() => setStep("role")} className="text-xs text-primary font-medium hover:underline flex-shrink-0">Cambiar</button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <div className="relative group">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input id="name" {...register("name")} placeholder="Tu nombre" className={`pl-10 h-11 bg-card/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all ${errors.name ? "border-destructive" : ""}`} autoComplete="name" />
                </div>
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input id="email" type="email" {...register("email")} placeholder="tu@email.com" className={`pl-10 h-11 bg-card/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all ${errors.email ? "border-destructive" : ""}`} autoComplete="email" />
                </div>
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input id="password" type={showPassword ? "text" : "password"} {...register("password")} placeholder="Mínimo 8 caracteres" className={`pl-10 pr-10 h-11 bg-card/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all ${errors.password ? "border-destructive" : ""}`} autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="passwordConfirm">Confirmar contraseña</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input id="passwordConfirm" type={showPasswordConfirm ? "text" : "password"} {...register("passwordConfirm")} placeholder="Repite tu contraseña" className={`pl-10 pr-10 h-11 bg-card/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all ${errors.passwordConfirm ? "border-destructive" : ""}`} autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPasswordConfirm(!showPasswordConfirm)} tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPasswordConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.passwordConfirm && <p className="text-xs text-destructive mt-1">{errors.passwordConfirm.message}</p>}
              </div>
              <Button type="submit" className="w-full h-11 shadow-lg shadow-primary/20" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creando cuenta...</> : `Crear cuenta como ${selectedRole === "admin_restaurante" ? "administrador" : "cliente"}`}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="text-primary font-semibold hover:underline">Inicia sesión</Link>
            </p>
          </motion.div>
        )}
      </motion.div>
    </AuthLayout>
  );
};

export default Register;
