import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ImagePlus, Trash2, Loader2, X } from "lucide-react";
import api from "@/services/api";
import { ImageUpload } from "@/components/restaurant/ImageUpload";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

interface Props {
  restauranteId: number;
}

export const GalleryManager = ({ restauranteId }: Props) => {
  const queryClient = useQueryClient();
  const [showUpload, setShowUpload] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: imagenes = [], isLoading } = useQuery({
    queryKey: ['imagenes', restauranteId],
    queryFn: async () => {
      const res = await api.get(`/restaurantes/${restauranteId}/imagenes`);
      return res.data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (imagenId: number) => {
      await api.delete(`/imagenes/${imagenId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['imagenes', restauranteId] });
      toast.success("Imagen eliminada");
    },
    onError: () => toast.error("Error al eliminar imagen"),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold">Galería de imágenes</h3>
        <Button variant="outline" size="sm" onClick={() => setShowUpload(!showUpload)}>
          <ImagePlus className="h-4 w-4 mr-1.5" /> Agregar
        </Button>
      </div>

      {showUpload && (
        <div className="animate-fade-in">
          <ImageUpload
            restauranteId={restauranteId}
            onImageUpdate={() => {
              queryClient.invalidateQueries({ queryKey: ['imagenes', restauranteId] });
              setShowUpload(false);
            }}
          />
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : imagenes.length === 0 ? (
        <div className="text-center py-8 rounded-xl border border-dashed border-border/30 bg-card/30">
          <ImagePlus className="h-8 w-8 mx-auto mb-2 text-muted-foreground/20" />
          <p className="text-sm text-muted-foreground">Sin imágenes aún</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          <AnimatePresence>
            {imagenes.map((img: any) => (
              <motion.div key={img.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className="group relative aspect-square rounded-xl overflow-hidden bg-muted border border-border/50">
                <img src={`/storage/${img.ruta}`} alt={img.nombre_original || "Foto"}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                  onClick={() => setPreviewUrl(`/storage/${img.ruta}`)} loading="lazy" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button onClick={() => deleteMutation.mutate(img.id)}
                    className="p-2 rounded-full bg-destructive/90 hover:bg-destructive text-white transition-colors"
                    aria-label="Eliminar imagen">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Preview modal */}
      <AnimatePresence>
        {previewUrl && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
            <button onClick={() => setPreviewUrl(null)} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors" aria-label="Cerrar">
              <X className="h-6 w-6" />
            </button>
            <img src={previewUrl} alt="Vista previa" className="max-h-[80vh] max-w-[90vw] rounded-xl object-contain" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
