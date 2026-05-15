import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Camera, Loader2, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface Props {
  restauranteId: number;
  currentImage?: string | null;
  onImageUpdate: (url: string) => void;
  className?: string;
}

export const ImageUpload = ({ restauranteId, currentImage, onImageUpdate, className }: Props) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("imagen", file);
      form.append("tipo", "portada");
      const res = await api.post(`/restaurantes/${restauranteId}/imagenes`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.imagen.url;
    },
    onSuccess: (url) => {
      onImageUpdate(url);
      setPreview(null);
      toast({ title: "Imagen actualizada", description: "La foto del restaurante se actualizó correctamente." });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Error", description: "No se pudo subir la imagen. Verifica que sea JPG, PNG o WebP y menor a 5MB." });
    },
  });

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", title: "Formato inválido", description: "Solo se permiten imágenes JPG, PNG y WebP." });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: "destructive", title: "Archivo muy grande", description: "La imagen debe ser menor a 5MB." });
      return;
    }
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    mutation.mutate(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const imageUrl = preview || (currentImage ? `/storage/${currentImage}` : null);

  return (
    <div className={cn("relative", className)}>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative aspect-[21/9] rounded-xl overflow-hidden border-2 border-dashed transition-all cursor-pointer group",
          dragOver ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/30",
          mutation.isPending && "pointer-events-none opacity-60"
        )}
      >
        {imageUrl ? (
          <>
            <img src={imageUrl} alt="Restaurante" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-8 w-8 text-white" />
                <p className="text-xs text-white mt-1">Cambiar foto</p>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Upload className="h-8 w-8" />
            <p className="text-sm font-medium">Arrastra una imagen o haz clic para subir</p>
            <p className="text-xs">JPG, PNG o WebP · Máx 5MB</p>
          </div>
        )}
        {mutation.isPending && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        )}
      </div>
    </div>
  );
};
