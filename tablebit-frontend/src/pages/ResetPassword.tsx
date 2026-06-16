import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, Check, AlertCircle, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import AuthLayout from "@/layouts/AuthLayout";

const resetSchema = z.object({
  password: z.string().min(8, "Mínimo 8 caracteres").max(128).regex(/[A-Z]/, "Debe contener una mayúscula").regex(/[a-z]/, "Debe contener una minúscula").regex(/[^a-zA-Z0-9]/, "Debe contener un carácter especial"),
  password_confirmation: z.string().min(1, "Confirma tu contraseña"),
}).refine((d) => d.password === d.password_confirmation, { message: "Las contraseñas no coinciden", path: ["password_confirmation"] });

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";
  const { toast } = useToast();
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useSEO({ title: "TableBit - Restablecer contraseña", description: "Crea una nueva contraseña" });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", password_confirmation: "" },
  });

  const onSubmit = async (data: { password: string; password_confirmation: string }) => {
    try {
      await authService.resetPassword({ email, token, password: data.password, password_confirmation: data.password_confirmation });
      setDone(true);
      toast({ title: "Contraseña actualizada" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err?.response?.data?.message || "Token inválido o expirado" });
    }
  };

  if (!token || !email) {
    return (
      <AuthLayout>
        <div className="text-center space-y-4 py-8">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive/50" />
          <h1 className="font-display text-xl font-bold">Enlace inválido</h1>
          <p className="text-sm text-muted-foreground">Este enlace de recuperación no es válido o ha expirado.</p>
          <Link to="/forgot-password" className="text-sm text-primary font-semibold hover:underline">Solicitar nuevo enlace</Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-display text-2xl font-bold">Nueva contraseña</h1>
          <p className="text-sm text-muted-foreground">Ingresa tu nueva contraseña para {email}</p>
        </div>

        {done ? (
          <div className="text-center space-y-4 py-8">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Check className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Tu contraseña ha sido actualizada correctamente.</p>
            <Link to="/login" className="text-sm text-primary font-semibold hover:underline inline-flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Iniciar sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password">Nueva contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} {...register("password")} placeholder="Mínimo 8 caracteres" className="pl-10 pr-10 h-11 bg-card/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Confirmar contraseña</Label>
              <Input id="password_confirmation" type="password" {...register("password_confirmation")} placeholder="Repite tu contraseña" className="h-11 bg-card/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all" />
              {errors.password_confirmation && <p className="text-xs text-destructive">{errors.password_confirmation.message}</p>}
            </div>
            <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Actualizando...</> : "Restablecer contraseña"}
            </Button>
          </form>
        )}
      </motion.div>
    </AuthLayout>
  );
};

export default ResetPassword;
