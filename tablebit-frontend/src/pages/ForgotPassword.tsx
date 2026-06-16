import { useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Check, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import AuthLayout from "@/layouts/AuthLayout";

const emailSchema = z.object({
  email: z.string().email("Email inválido"),
});

const ForgotPassword = () => {
  const { toast } = useToast();
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(emailSchema),
  });

  useSEO({ title: "TableBit - Recuperar contraseña", description: "Recupera tu contraseña de TableBit" });

  const onSubmit = async (data: { email: string }) => {
    try {
      await authService.forgotPassword({ email: data.email });
      setSent(true);
      toast({ title: "Correo enviado", description: "Si el correo existe, recibirás un enlace de recuperación." });
    } catch {
      toast({ title: "Correo enviado", description: "Si el correo existe, recibirás un enlace de recuperación." });
      setSent(true);
    }
  };

  return (
    <AuthLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="font-display text-2xl font-bold">Recuperar contraseña</h1>
          <p className="text-sm text-muted-foreground">Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.</p>
        </div>

        {sent ? (
          <div className="text-center space-y-4 py-8">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Check className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Revisa tu bandeja de entrada. Si el correo está registrado, recibirás las instrucciones.</p>
            <Link to="/login" className="text-sm text-primary font-semibold hover:underline inline-flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" {...register("email")} placeholder="tu@correo.com"
                  className="pl-10 h-11 bg-card/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all" />
              </div>
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
            </div>
            <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enviando...</> : "Enviar enlace"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              <Link to="/login" className="text-primary font-semibold hover:underline inline-flex items-center gap-1">
                <ArrowLeft className="h-3.5 w-3.5" /> Volver al inicio de sesión
              </Link>
            </p>
          </form>
        )}
      </motion.div>
    </AuthLayout>
  );
};

export default ForgotPassword;
