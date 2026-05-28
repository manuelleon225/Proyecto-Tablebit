import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Lock, Save, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import api from "@/services/api";
import { getImageUrl } from "@/lib/image";
import { MediaUploader } from "@/components/media/MediaUploader";

const profileSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(255),
  email: z.string().email("Ingresa un email válido"),
});

const passwordSchema = z.object({
  newPassword: z.string().min(6, "Mínimo 6 caracteres"),
  confirmPassword: z.string().min(1, "Confirma tu contraseña"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

const Profile = () => {
  const { user, updateProfile, updateUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(getImageUrl(user?.avatar));

  const handleAvatarUpload = async (files: File[]) => {
    try {
      const form = new FormData();
      form.append("avatar", files[0]);
      await api.post("/profile/avatar", form);
      const meRes = await api.get("/usuarios/me");
      updateUser(meRes.data);
      setAvatarUrl(getImageUrl(meRes.data.avatar));
      toast({ title: "Avatar actualizado", description: "Tu foto de perfil se ha actualizado." });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "No se pudo subir el avatar." });
    }
  };

  useSEO({
    title: "TableBit - Mi perfil",
    description: "Gestiona tu perfil y configuración de cuenta en TableBit.",
  });

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: profileSaving },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: passwordSaving },
    reset: resetPassword,
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSaveProfile = async (data: ProfileForm) => {
    const result = await updateProfile({ name: data.name, email: data.email });
    if (result.success) {
      toast({ title: "Perfil actualizado", description: "Tus datos se han guardado correctamente" });
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error || "Error al actualizar" });
    }
  };

  const onUpdatePassword = async (data: PasswordForm) => {
    const result = await updateProfile({
      password: data.newPassword,
      password_confirmation: data.confirmPassword,
    });
    if (result.success) {
      toast({ title: "Contraseña actualizada", description: "Tu contraseña se ha cambiado correctamente" });
      resetPassword();
    } else {
      toast({ variant: "destructive", title: "Error", description: result.error || "Error al actualizar" });
    }
  };

  const getUserRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      cliente: "Cliente",
      admin: "Administrador",
      admin_restaurante: "Admin Restaurante",
      superadmin: "Super Admin",
    };
    return labels[role] || role;
  };

  return (
    <MainLayout>
      <div className="container py-6 sm:py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Volver
        </Button>

        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">Mi Perfil</h1>
            <p className="text-muted-foreground mt-1">Gestiona tu información personal</p>
          </div>

          {/* Avatar Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Foto de Perfil</CardTitle>
              <CardDescription>Tu avatar en TableBit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <MediaUploader
                  type="avatar"
                  preview={avatarUrl}
                  onUpload={handleAvatarUpload}
                  fallback={<span className="text-2xl font-bold text-primary">{user?.name?.[0]?.toUpperCase() || "?"}</span>}
                  enableCrop
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG o WebP · Máx 2MB</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información Personal</CardTitle>
              <CardDescription>Tu nombre y dirección de email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rol:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {getUserRoleLabel(user?.role || "")}
                </span>
              </div>

              <Separator />

              <form onSubmit={handleProfileSubmit(onSaveProfile)}>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      Nombre
                    </Label>
                    <Input
                      id="name"
                      {...registerProfile("name")}
                      placeholder="Tu nombre"
                      className={profileErrors.name ? "border-destructive" : ""}
                    />
                    {profileErrors.name && <p className="text-xs text-destructive">{profileErrors.name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...registerProfile("email")}
                      placeholder="tu@email.com"
                      className={profileErrors.email ? "border-destructive" : ""}
                    />
                    {profileErrors.email && <p className="text-xs text-destructive">{profileErrors.email.message}</p>}
                  </div>

                  <Button type="submit" disabled={profileSaving} className="w-full sm:w-auto">
                    <Save className="h-4 w-4 mr-1.5" />
                    {profileSaving ? "Guardando..." : "Guardar cambios"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Password Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cambiar Contraseña</CardTitle>
              <CardDescription>Actualiza tu contraseña de acceso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <form onSubmit={handlePasswordSubmit(onUpdatePassword)}>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="flex items-center gap-2">
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      Nueva contraseña
                    </Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showPassword ? "text" : "password"}
                        {...registerPassword("newPassword")}
                        placeholder="Mínimo 6 caracteres"
                        className={`pr-10 ${passwordErrors.newPassword ? "border-destructive" : ""}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordErrors.newPassword && <p className="text-xs text-destructive">{passwordErrors.newPassword.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                    <Input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      {...registerPassword("confirmPassword")}
                      placeholder="Repite la contraseña"
                      className={passwordErrors.confirmPassword ? "border-destructive" : ""}
                    />
                    {passwordErrors.confirmPassword && <p className="text-xs text-destructive">{passwordErrors.confirmPassword.message}</p>}
                  </div>

                  <Button
                    type="submit"
                    disabled={passwordSaving}
                    className="w-full sm:w-auto"
                  >
                    <Lock className="h-4 w-4 mr-1.5" />
                    {passwordSaving ? "Actualizando..." : "Actualizar contraseña"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
