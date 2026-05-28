import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { restauranteService } from "@/services/restauranteService";
import { useRestaurante } from "@/context/RestauranteContext";
import { useBranding } from "@/context/BrandingContext";
import { useSEO } from "@/hooks/useSEO";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Save, Loader2, Check, Palette, ImageIcon, Clock, Store, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { handleApiError } from "@/services/api";
import api from "@/services/api";
import BrandingEditor from "@/components/branding/BrandingEditor";
import MediaSection from "@/components/media/MediaSection";
import { GalleryManager } from "@/components/restaurant/GalleryManager";
import { PhoneInputField } from "@/components/forms/PhoneInputField";
import { DEFAULT_BRANDING } from "@/lib/branding";
import type { BrandingConfig } from "@/lib/branding";
import { normalizePhone, validateColombianMobile } from "@/lib/phone";
import { TIPOS_COMIDA } from "@/constants/colombia";

const generalSchema = z.object({
  nombre: z.string().min(2, "Mínimo 2 caracteres").max(100),
  direccion: z.string().min(5, "Dirección muy corta").max(255),
  telefono: z.string().min(1, "El teléfono es obligatorio"),
  descripcion: z.string().min(10, "Mínimo 10 caracteres").max(1000),
  tipo_comida: z.string().min(2, "Selecciona un tipo"),
});

const TABS = [
  { id: "general", label: "General", icon: Store },
  { id: "visual", label: "Visual", icon: Palette },
  { id: "horarios", label: "Horarios", icon: Clock },
  { id: "galeria", label: "Galería", icon: ImageIcon },
];

const MiRestaurantePage = () => {
  const { selectedRestauranteId, misRestaurantes, restauranteActual } = useRestaurante();
  const { setBranding: setBrandingContext } = useBranding();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [tab, setTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useSEO({ title: "TableBit - Mi restaurante", description: "Administra la configuración de tu restaurante." });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(generalSchema),
    values: {
      nombre: restauranteActual?.nombre || "",
      direccion: restauranteActual?.direccion || "",
      telefono: restauranteActual?.telefono || "",
      descripcion: restauranteActual?.descripcion || "",
      tipo_comida: restauranteActual?.tipo_comida || "",
    },
  });

  const values = watch();

  // Branding state
  const [branding, setBrandingLocal] = useState<Partial<BrandingConfig>>(() => ({
    primary_color: restauranteActual?.branding?.primary_color || DEFAULT_BRANDING.primary_color,
    secondary_color: restauranteActual?.branding?.secondary_color || DEFAULT_BRANDING.secondary_color,
    accent_color: restauranteActual?.branding?.accent_color || DEFAULT_BRANDING.accent_color,
  }));

  const [uploadingMap, setUploadingMap] = useState<Record<string, boolean>>({});

  const uploadMutation = (tipo: string) => async (files: File[]) => {
    setUploadingMap((prev) => ({ ...prev, [tipo]: true }));
    try {
      const form = new FormData();
      form.append("imagen", files[0]);
      form.append("tipo", tipo);
      const res = await api.post(`/restaurantes/${selectedRestauranteId}/imagenes`, form);
      const updated = res.data?.restaurante;
      if (updated) {
        queryClient.setQueryData(['mis-restaurantes'], (old: any) =>
          Array.isArray(old) ? old.map((r: any) => r.id === updated.id ? updated : r) : [updated]);
      }
      queryClient.invalidateQueries({ queryKey: ['mis-restaurantes'] });
      toast({ title: "Imagen actualizada" });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: handleApiError(err).message });
    } finally {
      setUploadingMap((prev) => ({ ...prev, [tipo]: false }));
    }
  };

  const deleteMutation = (field: string) => async () => {
    try {
      const res = await api.put(`/restaurantes/${selectedRestauranteId}`, { [field]: null });
      const updated = res.data?.restaurante;
      if (updated) {
        queryClient.setQueryData(['mis-restaurantes'], (old: any) =>
          Array.isArray(old) ? old.map((r: any) => r.id === updated.id ? updated : r) : [updated]);
      }
      queryClient.invalidateQueries({ queryKey: ['mis-restaurantes'] });
      toast({ title: "Imagen eliminada" });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: handleApiError(err).message });
    }
  };

  const onSaveGeneral = async (data: typeof values) => {
    if (!selectedRestauranteId) return;
    setSaving(true);
    setSaved(false);
    try {
      await restauranteService.actualizar(selectedRestauranteId, {
        nombre: data.nombre,
        direccion: data.direccion,
        telefono: normalizePhone(data.telefono),
        descripcion: data.descripcion,
        tipo_comida: data.tipo_comida,
      });
      queryClient.invalidateQueries({ queryKey: ['mis-restaurantes'] });
      setSaved(true);
      toast({ title: "Cambios guardados" });
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: handleApiError(err).message });
    } finally {
      setSaving(false);
    }
  };

  const onSaveBranding = async () => {
    if (!selectedRestauranteId) return;
    setSaving(true);
    setSaved(false);
    try {
      await restauranteService.actualizar(selectedRestauranteId, { branding });
      setBrandingContext(branding);
      queryClient.invalidateQueries({ queryKey: ['mis-restaurantes'] });
      setSaved(true);
      toast({ title: "Colores guardados" });
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: handleApiError(err).message });
    } finally {
      setSaving(false);
    }
  };

  if (!selectedRestauranteId) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Store className="h-12 w-12 text-muted-foreground/20 mb-4" />
        <h2 className="font-display text-xl font-semibold mb-1">Selecciona un restaurante</h2>
        <p className="text-sm text-muted-foreground max-w-sm mb-4">Usa el selector del sidebar para elegir un restaurante.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold tracking-tight">Mi Restaurante</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{restauranteActual?.nombre}</p>
        </div>
        {tab === "general" || tab === "visual" ? (
          <Button onClick={tab === "general" ? handleSubmit(onSaveGeneral) : onSaveBranding} disabled={saving} className="shadow-sm gap-1.5">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saving ? "Guardando..." : saved ? "Guardado" : "Guardar cambios"}
          </Button>
        ) : null}
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:grid-cols-4 h-auto p-1 bg-muted/30">
          {TABS.map((t) => (
            <TabsTrigger key={t.id} value={t.id} className="flex items-center gap-2 py-2.5 data-[state=active]:shadow-sm">
              <t.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{t.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* GENERAL */}
        <TabsContent value="general" forceMount className={tab !== "general" ? "hidden" : "space-y-6 mt-6"}>
          <form onSubmit={handleSubmit(onSaveGeneral)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del restaurante *</Label>
                  <Input id="nombre" {...register("nombre")} className={`h-11 ${errors.nombre ? "border-destructive" : ""}`} />
                  {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción *</Label>
                  <textarea id="descripcion" {...register("descripcion")} rows={4}
                    className={`w-full px-3 py-2.5 rounded-lg border bg-background text-sm resize-none focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 ${errors.descripcion ? "border-destructive" : "border-border/50"}`} />
                  {errors.descripcion && <p className="text-xs text-destructive">{errors.descripcion.message}</p>}
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección *</Label>
                  <Input id="direccion" {...register("direccion")} className={`h-11 ${errors.direccion ? "border-destructive" : ""}`} />
                  {errors.direccion && <p className="text-xs text-destructive">{errors.direccion.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo_comida">Tipo de comida *</Label>
                  <select id="tipo_comida" {...register("tipo_comida")}
                    className={`flex h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 ${errors.tipo_comida ? "border-destructive" : "border-border/50"}`}>
                    <option value="">Seleccionar...</option>
                    {TIPOS_COMIDA.map((t: string) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errors.tipo_comida && <p className="text-xs text-destructive">{errors.tipo_comida.message}</p>}
                </div>
                <div className="space-y-2">
                  <PhoneInputField
                    value={values.telefono}
                    onChange={(v) => setValue("telefono", v)}
                    error={errors.telefono?.message}
                    label="Teléfono *"
                  />
                </div>
                {restauranteActual?.direccion && restauranteActual?.ciudad && (
                  <div className="pt-2 border-t border-border/20">
                    <Label>Ubicación</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {restauranteActual.direccion}, {restauranteActual.ciudad}
                    </p>
                    <a
                      href={`https://www.google.com/maps/search/${encodeURIComponent(`${restauranteActual.direccion}, ${restauranteActual.ciudad}`)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors mt-1"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      Ver en Google Maps
                    </a>
                  </div>
                )}
              </div>
            </div>
          </form>
        </TabsContent>

        {/* VISUAL */}
        <TabsContent value="visual" forceMount className={tab !== "visual" ? "hidden" : "space-y-6 mt-6"}>
          <div className="space-y-6">
            {/* Logo */}
            <div className="rounded-xl border border-border/40 bg-card p-5 space-y-4">
              <div>
                <h3 className="font-display text-sm font-semibold">Logo del restaurante</h3>
                <p className="text-xs text-muted-foreground">Cuadrado, recomendado 512x512px. Se muestra en el sidebar y selector.</p>
              </div>
              <div className="max-w-[200px]">
                <MediaSection
                  key={`logo-${restauranteActual?.logo}`}
                  title=""
                  imageUrl={restauranteActual?.logo}
                  type="logo"
                  onUploaded={uploadMutation("logo")}
                  onDeleted={deleteMutation("logo")}
                />
              </div>
            </div>

            {/* Galería principal */}
            <div className="rounded-xl border border-border/40 bg-card p-5 space-y-4">
              <div>
                <h3 className="font-display text-sm font-semibold">Galería principal</h3>
                <p className="text-xs text-muted-foreground">Sube varias imágenes. La primera será la portada del restaurante. Usa las flechas para ordenar.</p>
              </div>
              <GalleryManager restauranteId={selectedRestauranteId} showPrincipalBadge />
            </div>

            {/* Branding colors */}
            <div className="rounded-xl border border-border/40 bg-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-sm font-semibold">Colores de marca</h3>
                  <p className="text-xs text-muted-foreground">Personaliza los colores del dashboard</p>
                </div>
                <Button size="sm" onClick={onSaveBranding} disabled={saving} className="gap-1.5">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                  {saving ? "Guardando..." : "Guardar colores"}
                </Button>
              </div>
              <BrandingEditor branding={branding} onChange={setBrandingLocal} />
            </div>
          </div>
        </TabsContent>

        {/* HORARIOS */}
        <TabsContent value="horarios" forceMount className={tab !== "horarios" ? "hidden" : "mt-6"}>
          <div className="rounded-xl border border-border/40 bg-card">
            <HorariosStandalone restauranteId={selectedRestauranteId} />
          </div>
        </TabsContent>

        {/* GALERÍA */}
        <TabsContent value="galeria" forceMount className={tab !== "galeria" ? "hidden" : "mt-6"}>
          <div className="rounded-xl border border-border/40 bg-card p-5">
            <GalleryManager restauranteId={selectedRestauranteId} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Standalone horarios component (extracted from HorariosPage)
import { useQuery as useQueryH, useMutation as useMutationH } from "@tanstack/react-query";
import { Clock as ClockIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

interface HourRow {
  day_of_week: number;
  is_closed: boolean;
  open_time: string;
  close_time: string;
}

const HorariosStandalone = ({ restauranteId }: { restauranteId: number }) => {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: hoursData, isLoading } = useQueryH({
    queryKey: ['restaurant-hours', restauranteId],
    queryFn: async () => {
      const res = await restauranteService.getHours(restauranteId);
      return res.data || [];
    },
  });

  const [hours, setHours] = useState<HourRow[]>([]);

  const { refetch } = useQueryH({
    queryKey: ['restaurant-hours-init', restauranteId],
    queryFn: async () => {
      const res = await restauranteService.getHours(restauranteId);
      const data = Array.isArray(res.data) ? res.data : [];
      if (data.length === 0) {
        const defaultHours = Array.from({ length: 7 }, (_, i) => ({
          day_of_week: i, is_closed: i === 0, open_time: "09:00", close_time: "18:00",
        }));
        setHours(defaultHours);
      } else {
        setHours(data.map((h: any) => ({ day_of_week: h.day_of_week, is_closed: h.is_closed, open_time: (h.open_time || "09:00").substring(0, 5), close_time: (h.close_time || "18:00").substring(0, 5) })));
      }
      return data;
    },
    enabled: !!restauranteId,
  });

  const saveMutation = useMutationH({
    mutationFn: async () => {
      await restauranteService.updateHours(restauranteId, { hours });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['restaurant-hours', restauranteId] });
      qc.invalidateQueries({ queryKey: ['mis-restaurantes'] });
      toast({ title: "Horarios guardados" });
    },
    onError: (err) => toast({ variant: "destructive", title: "Error", description: handleApiError(err).message }),
  });

  const toggleDay = (idx: number) => {
    setHours((prev) => prev.map((h, i) => i === idx ? { ...h, is_closed: !h.is_closed } : h));
  };

  const updateTime = (idx: number, field: "open_time" | "close_time", value: string) => {
    setHours((prev) => prev.map((h, i) => i === idx ? { ...h, [field]: value } : h));
  };

  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Cargando horarios...</div>;

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold flex items-center gap-2">
          <ClockIcon className="h-4 w-4 text-muted-foreground" /> Horarios de atención
        </h3>
        <Button size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="gap-1.5">
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Guardar horarios
        </Button>
      </div>
      <div className="space-y-2">
        {hours.map((h, i) => (
          <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/20 transition-colors">
            <div className="flex items-center gap-2 min-w-[100px]">
              <Switch checked={!h.is_closed} onCheckedChange={() => toggleDay(i)} />
              <span className={`text-sm font-medium ${h.is_closed ? "text-muted-foreground/50 line-through" : ""}`}>{DAYS[h.day_of_week]}</span>
            </div>
            {!h.is_closed && (
              <div className="flex items-center gap-2 ml-auto">
                <input type="time" value={h.open_time} onChange={(e) => updateTime(i, "open_time", e.target.value)}
                  className="h-8 rounded-md border border-border/50 bg-background px-2 text-xs outline-none focus:border-primary/50" />
                <span className="text-xs text-muted-foreground">a</span>
                <input type="time" value={h.close_time} onChange={(e) => updateTime(i, "close_time", e.target.value)}
                  className="h-8 rounded-md border border-border/50 bg-background px-2 text-xs outline-none focus:border-primary/50" />
              </div>
            )}
            {h.is_closed && <span className="text-xs text-muted-foreground ml-auto">Cerrado</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MiRestaurantePage;
