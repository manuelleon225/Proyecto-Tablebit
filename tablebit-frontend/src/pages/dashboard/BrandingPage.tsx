import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { restauranteService } from "@/services/restauranteService";
import { useRestaurante } from "@/context/RestauranteContext";
import { useBranding } from "@/context/BrandingContext";
import { useSEO } from "@/hooks/useSEO";
import BrandingEditor from "@/components/branding/BrandingEditor";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Save, Loader2, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { handleApiError } from "@/services/api";
import { DEFAULT_BRANDING } from "@/lib/branding";
import type { BrandingConfig } from "@/lib/branding";

const BrandingPage = () => {
  const { selectedRestauranteId, restauranteActual } = useRestaurante();
  const { setBranding } = useBranding();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const savedRef = useRef(false);
  const originalRef = useRef<Partial<BrandingConfig>>(DEFAULT_BRANDING);

  useSEO({ title: "TableBit - Colores de marca", description: "Personaliza los colores de tu restaurante." });

  const { data: restauranteData } = useQuery({
    queryKey: ['restaurante-detalle', selectedRestauranteId],
    queryFn: async () => {
      const res = await restauranteService.getById(selectedRestauranteId!);
      return res.data.restaurante;
    },
    enabled: !!selectedRestauranteId,
  });

  const existingBranding = restauranteData?.branding || restauranteActual?.branding;

  const [branding, setBrandingLocal] = useState<Partial<BrandingConfig>>({
    primary_color: DEFAULT_BRANDING.primary_color,
    secondary_color: DEFAULT_BRANDING.secondary_color,
    accent_color: DEFAULT_BRANDING.accent_color,
  });

  useEffect(() => {
    if (existingBranding) {
      const next = {
        primary_color: existingBranding.primary_color || DEFAULT_BRANDING.primary_color,
        secondary_color: existingBranding.secondary_color || DEFAULT_BRANDING.secondary_color,
        accent_color: existingBranding.accent_color || DEFAULT_BRANDING.accent_color,
      };
      setBrandingLocal(next);
      originalRef.current = next;
    }
  }, [existingBranding?.primary_color, existingBranding?.secondary_color, existingBranding?.accent_color]);

  useEffect(() => {
    return () => {
      if (!savedRef.current) {
        setBranding(originalRef.current);
      }
    };
  }, []);

  const saveMutation = useMutation({
    mutationFn: (data: { branding: Partial<BrandingConfig> }) =>
      restauranteService.actualizar(selectedRestauranteId!, data),
    onSuccess: () => {
      savedRef.current = true;
      queryClient.invalidateQueries({ queryKey: ['restaurante-detalle', selectedRestauranteId] });
      queryClient.invalidateQueries({ queryKey: ['mis-restaurantes'] });
      toast({ title: "Colores guardados", description: "La marca del restaurante se actualizó correctamente." });
    },
    onError: (err) => {
      toast({ variant: "destructive", title: "Error", description: handleApiError(err).message });
    },
  });

  if (!selectedRestauranteId) {
    return (
        <div className="text-center py-20 text-muted-foreground">
          <Palette className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>Selecciona un restaurante para personalizar sus colores.</p>
        </div>
    );
  }

  return (
      <div className="max-w-xl space-y-6">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold tracking-tight">Colores de marca</h1>
          <p className="text-sm text-muted-foreground mt-1">{restauranteActual?.nombre || "Personaliza la identidad visual"}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Personalizar colores</CardTitle>
            <CardDescription>Elige un preset o personaliza cada color. Los cambios se ven en tiempo real.</CardDescription>
          </CardHeader>
          <CardContent>
            <BrandingEditor branding={branding} onChange={(b) => setBrandingLocal(b)} />
          </CardContent>
        </Card>

        <Button onClick={() => saveMutation.mutate({ branding })} disabled={saveMutation.isPending} className="shadow-lg shadow-primary/20">
          {saveMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Guardando...</> : <><Save className="h-4 w-4 mr-2" /> Guardar colores</>}
        </Button>
      </div>
  );
};

export default BrandingPage;
