import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useRestaurante } from "@/context/RestauranteContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Check, Building2, MapPin, Phone, UtensilsCrossed, Loader2, Sparkles, ChevronDown, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { handleApiError } from "@/services/api";
import { restauranteService } from "@/services/restauranteService";
import { authService } from "@/services/authService";
import { useSEO } from "@/hooks/useSEO";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { TIPOS_COMIDA, DEPARTAMENTOS, DEPARTAMENTOS_LIST } from "@/constants/colombia";
import api from "@/services/api";
import { MediaUploader } from "@/components/media/MediaUploader";
import { PhoneInputField } from "@/components/forms/PhoneInputField";
import { normalizePhone, validateColombianMobile } from "@/lib/phone";
import BrandingEditor from "@/components/branding/BrandingEditor";
import { DEFAULT_BRANDING } from "@/lib/branding";
import type { BrandingConfig } from "@/lib/branding";

const PHONE_REGEX = /^\+\d{1,4}\d{6,11}$/;

const createSchema = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres").max(100),
  tipo_comida: z.string().min(2, "Selecciona un tipo"),
  direccion: z.string().min(5, "Dirección muy corta").max(255),
  ciudad: z.string().min(2, "Selecciona una ciudad"),
  telefono: z.string().min(1, "El teléfono es obligatorio").refine((v) => validateColombianMobile(v), "Ingresa un número celular colombiano válido"),
  descripcion: z.string().min(10, "Mínimo 10 caracteres").max(1000),
  capacidad_total: z.coerce.number().min(1, "Mínimo 1 persona").max(9999),
});

type FormData = z.infer<typeof createSchema>;

const steps = [
  { title: "Restaurante", desc: "Nombre y tipo de comida" },
  { title: "Ubicación", desc: "Dirección y contacto" },
  { title: "Detalles", desc: "Descripción y capacidad" },
  { title: "Listo", desc: "Restaurante creado" },
];

const OnboardingRestaurante = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { setSelectedRestauranteId } = useRestaurante();
  const { updateUser } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [branding, setBranding] = useState<Partial<BrandingConfig>>({
    primary_color: DEFAULT_BRANDING.primary_color,
    secondary_color: DEFAULT_BRANDING.secondary_color,
    accent_color: DEFAULT_BRANDING.accent_color,
  });
  const [brandingOpen, setBrandingOpen] = useState(false);
  const createdIdRef = useRef<number | null>(null);


  useSEO({ title: "TableBit - Configurar restaurante", description: "Crea tu restaurante en TableBit." });

  const { register, handleSubmit, setValue, watch, trigger, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(createSchema),
    defaultValues: { nombre: "", tipo_comida: "", direccion: "", ciudad: "", telefono: "", descripcion: "", capacidad_total: 50 },
  });

  const values = watch();
  const [depto, setDepto] = useState("");
  const [otraComida, setOtraComida] = useState("");
  const ciudades = depto ? (DEPARTAMENTOS[depto] || []) : [];

  const canProceed = async () => {
    if (step === 0) return !!(values.nombre?.trim() && values.tipo_comida?.trim());
    if (step === 1) return !!(values.direccion?.trim() && values.ciudad && values.telefono && validateColombianMobile(values.telefono));
    if (step === 2) return !!(values.descripcion?.trim() && values.capacidad_total > 0);
    return true;
  };

  const handleNext = async () => {
    const fields = step === 0 ? ["nombre", "tipo_comida"] as const : step === 1 ? ["direccion", "ciudad", "telefono"] as const : ["descripcion", "capacidad_total"] as const;
    const valid = await trigger(fields as any);
    if (valid) setStep(step + 1);
  };

  const onSubmit = async () => {
    setLoading(true);
    try {
      const payload: any = {
        nombre: values.nombre, direccion: values.direccion, ciudad: values.ciudad,
        tipo_comida: values.tipo_comida, telefono: normalizePhone(values.telefono),
        descripcion: values.descripcion, capacidad_total: values.capacidad_total,
      };
      if (brandingOpen) payload.branding = branding;
      const res = await restauranteService.crear(payload);
      const created = res.data?.restaurante;
      if (created?.id) {
        setSelectedRestauranteId(created.id);
        createdIdRef.current = created.id;
        queryClient.invalidateQueries({ queryKey: ['mis-restaurantes'] });
        // Refresh auth state to set requiresOnboarding=false
        try { const me = await authService.getMe(); updateUser(me); } catch {}
      }
      setStep(3);
      toast({ title: "Restaurante creado", description: "Todo listo para gestionar reservas." });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: handleApiError(err).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/50">
      <header className="sticky top-0 z-50 border-b border-border/30 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 sm:h-16 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-lg hover:bg-muted/50 transition-colors active:scale-95" aria-label="Volver">
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            </button>
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
              <UtensilsCrossed className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">TableBit</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg">
          <div className="flex items-center gap-2 mb-8 justify-center">
            {steps.map((s, i) => (
              <div key={s.title} className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  i < step ? "bg-primary text-primary-foreground" : i === step ? "bg-primary/10 text-primary border-2 border-primary" : "bg-muted text-muted-foreground"
                }`}>{i < step ? <Check className="h-4 w-4" /> : i + 1}</div>
                {i < steps.length - 1 && <div className={`h-0.5 w-8 sm:w-12 ${i < step ? "bg-primary" : "bg-muted"}`} />}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              {step === 0 && (
                <div className="space-y-5">
                  <div className="text-center mb-2">
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 border border-primary/10 px-3 py-1 text-xs font-medium text-primary mb-3"><Building2 className="h-3 w-3" /> Información básica</div>
                    <h2 className="font-display text-2xl font-bold">¿Cómo se llama tu restaurante?</h2>
                    <p className="text-sm text-muted-foreground mt-1">Nombre y tipo de cocina</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre del restaurante *</Label>
                    <Input id="nombre" {...register("nombre")} placeholder="Ej: Sushi Bar Ikigai" className={`h-11 bg-card/50 ${errors.nombre ? "border-destructive" : ""}`} />
                    {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de comida *</Label>
                    <Select onValueChange={(v) => { setValue("tipo_comida", v); setOtraComida(v === "Otra" ? "" : "no"); }}>
                      <SelectTrigger className={`h-11 bg-card/50 ${errors.tipo_comida ? "border-destructive" : ""}`}>
                        <SelectValue placeholder="Selecciona tipo de cocina" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIPOS_COMIDA.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {values.tipo_comida === "Otra" && (
                      <Input placeholder="Especifica el tipo de comida" value={otraComida} onChange={(e) => { setOtraComida(e.target.value); setValue("tipo_comida", e.target.value); }}
                        className="h-11 bg-card/50 mt-2" />
                    )}
                    {errors.tipo_comida && <p className="text-xs text-destructive">{errors.tipo_comida.message}</p>}
                  </div>
                </div>
              )}
              {step === 1 && (
                <div className="space-y-5">
                  <div className="text-center mb-2">
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 border border-primary/10 px-3 py-1 text-xs font-medium text-primary mb-3"><MapPin className="h-3 w-3" /> Ubicación</div>
                    <h2 className="font-display text-2xl font-bold">¿Dónde está ubicado?</h2>
                    <p className="text-sm text-muted-foreground mt-1">Dirección y contacto</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Departamento *</Label>
                      <Select onValueChange={(v) => { setDepto(v); setValue("ciudad", ""); }}>
                        <SelectTrigger className="h-11 bg-card/50">
                          <SelectValue placeholder="Selecciona un departamento" />
                        </SelectTrigger>
                        <SelectContent>
                          {DEPARTAMENTOS_LIST.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Ciudad *</Label>
                      <Select onValueChange={(v) => setValue("ciudad", v)} disabled={!depto}>
                        <SelectTrigger className={`h-11 bg-card/50 ${errors.ciudad ? "border-destructive" : ""}`}>
                          <SelectValue placeholder={depto ? "Ciudad" : "Primero depto"} />
                        </SelectTrigger>
                        <SelectContent>
                          {ciudades.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      {errors.ciudad && <p className="text-xs text-destructive">{errors.ciudad.message}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="direccion">Dirección *</Label>
                    <Input id="direccion" {...register("direccion")} placeholder="Calle 123 #45-67" className={`h-11 bg-card/50 ${errors.direccion ? "border-destructive" : ""}`} />
                    {errors.direccion && <p className="text-xs text-destructive">{errors.direccion.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <PhoneInputField
                        value={values.telefono || ""}
                        onChange={(v) => setValue("telefono", v)}
                        error={errors.telefono?.message}
                        defaultCountry="CO"
                      />
                    </div>
                  </div>
                </div>
              )}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="text-center mb-2">
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 border border-primary/10 px-3 py-1 text-xs font-medium text-primary mb-3"><Sparkles className="h-3 w-3" /> Detalles</div>
                    <h2 className="font-display text-2xl font-bold">Cuéntanos más</h2>
                    <p className="text-sm text-muted-foreground mt-1">Descripción y capacidad</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descripcion">Descripción *</Label>
                    <textarea id="descripcion" {...register("descripcion")} placeholder="Describe tu restaurante..." className={`w-full h-24 px-3 py-2 rounded-lg bg-card/50 border text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all resize-none ${errors.descripcion ? "border-destructive" : "border-border/50"}`} />
                    {errors.descripcion && <p className="text-xs text-destructive">{errors.descripcion.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacidad_total">Capacidad total *</Label>
                    <Input id="capacidad_total" type="number" {...register("capacidad_total")} min={1} className={`h-11 bg-card/50 ${errors.capacidad_total ? "border-destructive" : ""}`} />
                    {errors.capacidad_total && <p className="text-xs text-destructive">{errors.capacidad_total.message}</p>}
                  </div>

                  <div className="border-t border-border/30 pt-4">
                    <button type="button" onClick={() => setBrandingOpen(!brandingOpen)}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
                    >
                      <Palette className="h-4 w-4" />
                      <span>Colores de marca</span>
                      <span className="text-[10px] text-muted-foreground">(opcional)</span>
                      <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${brandingOpen ? "rotate-180" : ""}`} />
                    </button>
                    {brandingOpen && (
                      <div className="mt-3">
                        <BrandingEditor branding={branding} onChange={(b) => setBranding(b)} />
                      </div>
                    )}
                  </div>
                </div>
              )}
              {step === 3 && (
                <div className="text-center py-6">
                  <div className="h-16 w-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4"><Check className="h-8 w-8 text-success" /></div>
                  <h2 className="font-display text-2xl font-bold">¡Restaurante creado!</h2>
                  <p className="text-sm text-muted-foreground mt-2 mb-8 max-w-sm mx-auto">{values.nombre} está listo.</p>

                  {createdIdRef.current && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 max-w-xl mx-auto text-left">
                      <div className="rounded-xl border border-border/40 bg-card p-4 space-y-3">
                        <p className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">Logo</p>
                        <MediaUploader
                          type="logo"
                          enableCrop
                          cropShape="round"
                          cropAspect={1}
                          onUpload={async (files) => {
                            const form = new FormData();
                            form.append("imagen", files[0]);
                            form.append("tipo", "logo");
                            const res = await api.post(`/restaurantes/${createdIdRef.current}/imagenes`, form);
                            const updated = res.data?.restaurante;
                            if (updated) queryClient.setQueryData(['mis-restaurantes'], (old: any) => Array.isArray(old) ? old.map((r: any) => r.id === updated.id ? updated : r) : [updated]);
                            queryClient.invalidateQueries({ queryKey: ['mis-restaurantes'] });
                            toast({ title: "Logo subido", description: "Logo del restaurante actualizado." });
                          }}
                        />
                      </div>
                      <div className="rounded-xl border border-border/40 bg-card p-4 space-y-3">
                        <p className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">Portada</p>
                        <MediaUploader
                          type="cover"
                          enableCrop
                          onUpload={async (files) => {
                            const form = new FormData();
                            form.append("imagen", files[0]);
                            form.append("tipo", "portada");
                            const res = await api.post(`/restaurantes/${createdIdRef.current}/imagenes`, form);
                            const updated = res.data?.restaurante;
                            if (updated) queryClient.setQueryData(['mis-restaurantes'], (old: any) => Array.isArray(old) ? old.map((r: any) => r.id === updated.id ? updated : r) : [updated]);
                            queryClient.invalidateQueries({ queryKey: ['mis-restaurantes'] });
                            toast({ title: "Portada subida", description: "Imagen de portada actualizada." });
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 max-w-xs mx-auto">
                    <Button onClick={() => navigate("/dashboard/mesas")}>Configurar mesas</Button>
                    <Button variant="outline" onClick={() => navigate("/dashboard")}>Ir al dashboard</Button>
                  </div>
                </div>
              )}

              {step < 3 && (
                <div className="flex gap-3 pt-4">
                  {step > 0 && <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1"><ArrowLeft className="h-4 w-4 mr-2" /> Atrás</Button>}
                  <Button onClick={step === 2 ? handleSubmit(onSubmit) : handleNext} disabled={loading} className="flex-1">
                    {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creando...</> : step === 2 ? "Crear restaurante" : "Continuar"}
                    {step < 2 && <ArrowRight className="h-4 w-4 ml-2" />}
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default OnboardingRestaurante;
