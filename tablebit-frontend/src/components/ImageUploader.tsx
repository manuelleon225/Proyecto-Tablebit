import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { imagenService } from "@/services/imagenService";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  restauranteId: number;
  tipo?: "logo" | "galeria" | "portada";
  currentImage?: string;
  label?: string;
  className?: string;
  onSuccess?: (url: string) => void;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

const ImageUploader = ({
  restauranteId,
  tipo = "galeria",
  currentImage,
  label = "Subir imagen",
  className,
  onSuccess,
}: ImageUploaderProps) => {
  const [preview, setPreview] = useState<string>(currentImage || "");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = async (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Formato inválido",
        description: "Solo se permiten JPEG, PNG, JPG y WebP",
      });
      return;
    }
    if (file.size > MAX_SIZE) {
      toast({
        variant: "destructive",
        title: "Archivo muy grande",
        description: "El tamaño máximo permitido es 5MB",
      });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);

    try {
      const result = await imagenService.subirImagen(restauranteId, file, tipo);
      toast({ title: "Imagen subida", description: "Se subió correctamente" });
      if (onSuccess) onSuccess(result.data.imagen.url);
    } catch {
      setPreview(currentImage || "");
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo subir la imagen",
      });
    } finally {
      setUploading(false);
      URL.revokeObjectURL(objectUrl);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div
        onDragEnter={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragActive(false);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[160px]",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/50",
          uploading && "pointer-events-none opacity-60",
          preview && "p-0 overflow-hidden"
        )}
      >
        {preview ? (
          <div className="relative w-full h-full min-h-[160px]">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover rounded-xl"
              loading="lazy"
            />
            {uploading && (
              <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setPreview("");
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            {uploading ? (
              <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
            ) : (
              <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
            )}
            <p className="mt-2 text-sm text-muted-foreground">{label}</p>
            <p className="text-xs text-muted-foreground/60">
              Arrastra o haz clic · JPEG, PNG, WebP · Max 5MB
            </p>
          </>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg,image/webp"
        onChange={handleChange}
        className="hidden"
        disabled={uploading}
      />
      {!preview && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="h-3.5 w-3.5 mr-1.5" />
          Seleccionar archivo
        </Button>
      )}
    </div>
  );
};

export default ImageUploader;
