import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRestaurante } from "@/context/RestauranteContext";
import { useSEO } from "@/hooks/useSEO";
import api from "@/services/api";
import MediaSection from "@/components/media/MediaSection";
import { GalleryManager } from "@/components/restaurant/GalleryManager";
import { useToast } from "@/hooks/use-toast";
import { handleApiError } from "@/services/api";
import { ImageIcon, Loader2 } from "lucide-react";

const RestaurantMediaSettings = () => {
  const { selectedRestauranteId, restauranteActual } = useRestaurante();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [refreshKey, setRefreshKey] = useState(0);

  useSEO({ title: "TableBit - Medios del restaurante", description: "Administra las imágenes de tu restaurante." });

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
        queryClient.setQueryData(['mis-restaurantes'], (old: any) => {
          if (!Array.isArray(old)) return [updated];
          return old.map((r: any) => r.id === updated.id ? updated : r);
        });
      }
      queryClient.invalidateQueries({ queryKey: ['mis-restaurantes'] });
      queryClient.invalidateQueries({ queryKey: ['restaurante-detalle', selectedRestauranteId] });
      setRefreshKey((k) => k + 1);
      toast({ title: "Imagen actualizada" });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: handleApiError(err).message });
    } finally {
      setUploadingMap((prev) => ({ ...prev, [tipo]: false }));
    }
  };

  const deleteMutation = (tipo: string, field: string) => async () => {
    try {
      const res = await api.put(`/restaurantes/${selectedRestauranteId}`, { [field]: null });
      const updated = res.data?.restaurante;
      if (updated) {
        queryClient.setQueryData(['mis-restaurantes'], (old: any) => {
          if (!Array.isArray(old)) return [updated];
          return old.map((r: any) => r.id === updated.id ? updated : r);
        });
      }
      queryClient.invalidateQueries({ queryKey: ['mis-restaurantes'] });
      queryClient.invalidateQueries({ queryKey: ['restaurante-detalle', selectedRestauranteId] });
      setRefreshKey((k) => k + 1);
      toast({ title: "Imagen eliminada" });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: handleApiError(err).message });
    }
  };

  if (!selectedRestauranteId) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
        <p>Selecciona un restaurante para administrar sus imágenes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl lg:text-3xl font-bold tracking-tight">Medios</h1>
        <p className="text-sm text-muted-foreground mt-1">{restauranteActual?.nombre || "Administra las imágenes de tu restaurante"}</p>
      </div>

      {/* Banner */}
      <MediaSection
        key={`banner-${restauranteActual?.banner || 'none'}-${refreshKey}`}
        title="Banner"
        description="Imagen panorámica de cabecera (21:9)"
        imageUrl={restauranteActual?.banner}
        type="banner"
        onUploaded={uploadMutation("banner")}
        onDeleted={deleteMutation("banner", "banner")}
      />

      {/* Logo + Cover side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MediaSection
          key={`logo-${restauranteActual?.logo || 'none'}-${refreshKey}`}
          title="Logo"
          description="Logo cuadrado del restaurante"
          imageUrl={restauranteActual?.logo}
          type="logo"
          onUploaded={uploadMutation("logo")}
          onDeleted={deleteMutation("logo", "logo")}
        />
        <MediaSection
          key={`portada-${restauranteActual?.imagen || 'none'}-${refreshKey}`}
          title="Portada"
          description="Imagen principal (16:9)"
          imageUrl={restauranteActual?.imagen}
          type="cover"
          onUploaded={uploadMutation("portada")}
          onDeleted={deleteMutation("portada", "imagen")}
        />
      </div>

      {/* Gallery */}
      {selectedRestauranteId && <GalleryManager restauranteId={selectedRestauranteId} />}
    </div>
  );
};

export default RestaurantMediaSettings;
