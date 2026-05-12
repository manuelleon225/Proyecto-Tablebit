import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UtensilsCrossed, Loader2, Mail, Lock, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";

const registerSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(255),
  email: z.string().email("Ingresa un email válido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  passwordConfirm: z.string().min(1, "Confirma tu contraseña"),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Las contraseñas no coinciden",
  path: ["passwordConfirm"],
});

type RegisterForm = z.infer<typeof registerSchema>;

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useSEO({
    title: "TableBit - Crear cuenta",
    description: "Regístrate en TableBit y empieza a reservar mesas en los mejores restaurantes.",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    const result = await registerUser({
      name: data.name,
      email: data.email,
      password: data.password,
    });
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Tu nombre"
                  className={`pl-10 ${errors.name ? "border-destructive" : ""}`}
                  autoComplete="name"
                />
              </div>
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="tu@email.com"
                  className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  placeholder="Mínimo 6 caracteres"
                  className={`pl-10 ${errors.password ? "border-destructive" : ""}`}
                  autoComplete="new-password"
                />
              </div>
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">Confirmar contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="passwordConfirm"
                  type="password"
                  {...register("passwordConfirm")}
                  placeholder="Repite tu contraseña"
                  className={`pl-10 ${errors.passwordConfirm ? "border-destructive" : ""}`}
                  autoComplete="new-password"
                />
              </div>
              {errors.passwordConfirm && <p className="text-xs text-destructive mt-1">{errors.passwordConfirm.message}</p>}
            </div>
            <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
              {isSubmitting ? (
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
