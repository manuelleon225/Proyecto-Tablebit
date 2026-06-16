import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ImagePlus, Trash2, Loader2, ChevronUp, ChevronDown, Star, StarOff, ZoomIn } from "lucide-react";
import api from "@/services/api";
import { MediaUploader } from "@/components/media/MediaUploader";
import MediaLightbox from "@/components/media/MediaLightbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getImageUrl, handleImageError, PLACEHOLDER_RESTAURANT } from "@/lib/image";

interface Props {
  restauranteId: number;
  showPrincipalBadge?: boolean;
  type?: "principal" | "galeria";
}

export const GalleryManager = ({ restauranteId, showPrincipalBadge, type = "galeria" }: Props) => {
  const queryClient = useQueryClient();
  const [showUpload, setShowUpload] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [localImages, setLocalImages] = useState<any[]>([]);

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const form = new FormData();
      form.append("imagen", files[0]);
      form.append("tipo", type === "principal" ? type : "galeria");
      return api.post(`/restaurantes/${restauranteId}/imagenes`, form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imagenes', restauranteId] });
      queryClient.invalidateQueries({ queryKey: ['mis-restaurantes'] });
      setShowUpload(false);
      toast.success("Imagen subida correctamente");
    },
    onError: () => toast.error("No se pudo subir la imagen"),
  });

  const { data: imagenes = [], isLoading } = useQuery({
    queryKey: ['imagenes', restauranteId],
    queryFn: async () => {
      const res = await api.get(`/restaurantes/${restauranteId}/imagenes`);
      const data = (res.data || []).filter((img: any) => type === "principal" || img.tipo !== "principal");
      setLocalImages(data);
      return data;
    },
  });

  const displayImages = localImages.length > 0 ? localImages : imagenes;

  const deleteMutation = useMutation({
    mutationFn: async (imagenId: number) => {
      await api.delete(`/imagenes/${imagenId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imagenes', restauranteId] });
      queryClient.invalidateQueries({ queryKey: ['mis-restaurantes'] });
      toast.success("Imagen eliminada");
    },
    onError: () => toast.error("Error al eliminar imagen"),
  });

  const reorderMutation = useMutation({
    mutationFn: async (ordenes: { id: number; orden: number }[]) => {
      await api.put("/imagenes/reordenar", { ordenes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mis-restaurantes'] });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['imagenes', restauranteId] });
      toast.error("Error al reordenar");
    },
  });

  const moveImage = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === displayImages.length - 1) return;

    const updated = [...displayImages];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [updated[index], updated[swapIndex]] = [updated[swapIndex], updated[index]];
    setLocalImages(updated);

    const ordenes = updated.map((img: any, i: number) => ({ id: img.id, orden: i }));
    reorderMutation.mutate(ordenes);
  };

  const setAsPrimary = (index: number) => {
    const updated = [...displayImages];
    const [selected] = updated.splice(index, 1);
    updated.unshift(selected);
    setLocalImages(updated);
    const ordenes = updated.map((img: any, i: number) => ({ id: img.id, orden: i }));
    reorderMutation.mutate(ordenes);
    toast.success("Imagen principal actualizada");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-sm">
            {type === "principal" ? "Galería principal" : "Galería de imágenes"}
          </h3>
          {type === "principal" && (
            <p className="text-xs text-muted-foreground mt-0.5">
              La primera imagen será la portada del restaurante. Usa las flechas para ordenar.
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowUpload(!showUpload)}>
          <ImagePlus className="h-4 w-4 mr-1.5" /> Agregar
        </Button>
      </div>

      {showUpload && (
        <div className="animate-fade-in rounded-xl border border-dashed border-border/40 bg-muted/10 p-4">
          <MediaUploader
            type="cover"
            onUpload={(files) => uploadMutation.mutateAsync(files)}
            disabled={uploadMutation.isPending}
            enableCrop
          />
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="aspect-video rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : displayImages.length === 0 ? (
        <div className="text-center py-10 rounded-xl border border-dashed border-border/30 bg-card/30">
          <ImagePlus className="h-10 w-10 mx-auto mb-3 text-muted-foreground/20" />
          <p className="text-sm text-muted-foreground mb-1">Sin imágenes aún</p>
          <p className="text-xs text-muted-foreground/60">Sube fotos para mostrar tu restaurante</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <AnimatePresence>
            {displayImages.map((img: any, index: number) => {
              const isPrimary = showPrincipalBadge && index === 0;
              return (
                <motion.div
                  key={img.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`group relative rounded-xl overflow-hidden bg-muted border-2 transition-all ${
                    isPrimary ? "border-primary/40 shadow-md shadow-primary/5" : "border-border/40 hover:border-border/60"
                  }`}
                >
                  {/* Image */}
                  <div className="aspect-video">
                    <img src={getImageUrl(img.ruta) || PLACEHOLDER_RESTAURANT} alt={img.nombre_original || "Foto"}
                      className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      onError={(e) => handleImageError(e, PLACEHOLDER_RESTAURANT)} />
                  </div>

                  {/* Primary badge */}
                  {isPrimary && (
                    <div className="absolute top-2 left-2 z-10">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary text-[10px] font-semibold text-primary-foreground shadow-sm">
                        <Star className="h-3 w-3 fill-current" />
                        Principal
                      </span>
                    </div>
                  )}

                  {/* Overlay actions */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                      {/* Move buttons */}
                      <div className="flex gap-0.5">
                        <button onClick={() => moveImage(index, "up")} disabled={index === 0}
                          className="h-7 w-7 rounded-lg bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Subir">
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => moveImage(index, "down")} disabled={index === displayImages.length - 1}
                          className="h-7 w-7 rounded-lg bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Bajar">
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-0.5">
                        <button onClick={() => setPreviewIndex(index)}
                          className="h-7 w-7 rounded-lg bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors" aria-label="Ver imagen">
                          <ZoomIn className="h-3.5 w-3.5" />
                        </button>
                        {showPrincipalBadge && !isPrimary && (
                          <button onClick={() => setAsPrimary(index)}
                            className="h-7 w-7 rounded-lg bg-white/20 hover:bg-yellow-400/60 text-white flex items-center justify-center transition-colors" aria-label="Establecer como principal" title="Establecer como principal">
                            <StarOff className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button onClick={() => { if (confirm("¿Eliminar esta imagen?")) deleteMutation.mutate(img.id); }}
                          className="h-7 w-7 rounded-lg bg-destructive/70 hover:bg-destructive text-white flex items-center justify-center transition-colors" aria-label="Eliminar">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Loading state for delete */}
                  {deleteMutation.isPending && (
                    <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {previewIndex !== null && displayImages.length > 0 && (
        <MediaLightbox
          images={displayImages}
          currentIndex={previewIndex}
          onClose={() => setPreviewIndex(null)}
          onNavigate={setPreviewIndex}
        />
      )}
    </div>
  );
};
