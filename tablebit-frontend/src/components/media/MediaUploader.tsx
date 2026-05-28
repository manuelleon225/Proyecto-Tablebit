import { useState, useRef, useEffect } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { Camera, Loader2, X, Upload, CropIcon, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { getImageUrl, handleImageError, PLACEHOLDER_RESTAURANT, PLACEHOLDER_AVATAR } from "@/lib/image";
import { createCroppedImage, type CompressionResult } from "./cropUtils";

type MediaType = "avatar" | "logo" | "cover" | "gallery";
type CropShape = "rect" | "round";
type CropAspect = number; // ej. 1/1, 16/9, 4/3

interface MediaUploaderProps {
  type: MediaType;
  multiple?: boolean;
  maxFiles?: number;
  preview?: string | null;
  onUpload: (files: File[]) => Promise<void> | void;
  existingImages?: string[];
  className?: string;
  disabled?: boolean;
  fallback?: React.ReactNode;
  enableCrop?: boolean;
  cropAspect?: CropAspect;
  cropShape?: CropShape;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;
const AVATAR_MAX_SIZE = 2 * 1024 * 1024;

export const MediaUploader = ({
  type,
  multiple = false,
  preview,
  onUpload,
  className,
  disabled = false,
  fallback,
  enableCrop = false,
  cropAspect,
  cropShape,
}: MediaUploaderProps) => {
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevObjectUrl = useRef<string | null>(null);
  const { toast } = useToast();

  const resolvedAspect = cropAspect ?? (type === "avatar" ? 1 : type === "cover" ? 16 / 9 : undefined);
  const resolvedShape = cropShape ?? (type === "avatar" ? "round" : "rect");

  useEffect(() => {
    return () => {
      if (prevObjectUrl.current) URL.revokeObjectURL(prevObjectUrl.current);
    };
  }, []);

  const validateFile = (file: File): boolean => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({ variant: "destructive", title: "Formato inválido", description: "Solo se permiten JPEG, PNG y WebP." });
      return false;
    }
    const maxSize = type === "avatar" ? AVATAR_MAX_SIZE : MAX_SIZE;
    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: "Archivo muy grande",
        description: type === "avatar" ? "El avatar debe ser menor a 2MB." : "La imagen debe ser menor a 5MB.",
      });
      return false;
    }
    return true;
  };

  const handleFiles = async (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter(validateFile);
    if (validFiles.length === 0) return;

    if (prevObjectUrl.current) URL.revokeObjectURL(prevObjectUrl.current);

    if (!multiple) {
      const objectUrl = URL.createObjectURL(validFiles[0]);
      prevObjectUrl.current = objectUrl;
      setLocalPreview(objectUrl);
    }

    if (enableCrop && !multiple) {
      setSelectedFile(validFiles[0]);
      setCropModalOpen(true);
      return;
    }

    setUploading(true);
    try {
      await onUpload(validFiles);
    } catch {
      if (!multiple) setLocalPreview(null);
    } finally {
      setUploading(false);
      if (!multiple) {
        setSelectedFile(null);
        setCroppedAreaPixels(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      }
    }
  };

  const handleCropConfirm = async () => {
    setCropModalOpen(false);
    if (!selectedFile || !croppedAreaPixels || !prevObjectUrl.current) return;
    setUploading(true);
    try {
      const result = await createCroppedImage(prevObjectUrl.current, croppedAreaPixels, type, selectedFile.size);
      if (!result) {
        toast({ variant: "destructive", title: "Error al procesar", description: "No se pudo procesar la imagen. Intenta con un archivo más pequeño o en formato JPEG." });
        return;
      }
      setCompressionResult(result);
      const croppedFile = new File([result.blob], selectedFile.name, { type: result.mimeType });
      await onUpload([croppedFile]);
    } catch (err: any) {
      setLocalPreview(null);
      const msg = err?.response?.data?.message || err?.message || "";
      toast({
        variant: "destructive",
        title: "Error",
        description: msg.includes("recortar") ? msg : `No se pudo subir: ${msg || "Error de conexión"}`,
      });
    } finally {
      setUploading(false);
      setSelectedFile(null);
      setCroppedAreaPixels(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setTimeout(() => setCompressionResult(null), 5000);
    }
  };

  const handleCropCancel = () => {
    setCropModalOpen(false);
    setSelectedFile(null);
    setLocalPreview(null);
    setCroppedAreaPixels(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    if (prevObjectUrl.current) {
      URL.revokeObjectURL(prevObjectUrl.current);
      prevObjectUrl.current = null;
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  const onCropComplete = (_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  };

  const displayPreview = localPreview || preview || null;
  const placeholder = type === "avatar" ? PLACEHOLDER_AVATAR : PLACEHOLDER_RESTAURANT;

  const cropModal = (
    <Dialog open={cropModalOpen} onOpenChange={(open) => { if (!open) handleCropCancel(); }}>
      <DialogContent className="sm:max-w-xl p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <CropIcon className="h-5 w-5 text-primary" />
            Ajustar imagen
          </DialogTitle>
          <DialogDescription>
            Recorta la imagen para ajustarla al formato{" "}
            {type === "avatar" ? "cuadrado (1:1)" : type === "cover" ? "panorámico (16:9)" : "deseado"}.
            Arrastra para posicionar, usa la rueda o el slider para zoom.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-0">
          <div className="relative w-full min-h-[250px] max-h-[55vh] bg-neutral-900 dark:bg-black shadow-inner">
            {prevObjectUrl.current && (
              <Cropper
                image={prevObjectUrl.current}
                crop={crop}
                zoom={zoom}
                aspect={resolvedAspect ?? undefined}
                cropShape={resolvedShape}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>
          <div className="flex flex-col gap-4 px-6 py-4">
            <div className="flex items-center gap-3">
              <ZoomIn className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                aria-label="Zoom del recorte"
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gradient-to-r from-muted to-muted-foreground/20 accent-primary [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md"
              />
              <span className="text-xs text-muted-foreground tabular-nums w-8 text-right font-medium">{zoom}x</span>
            </div>
            <div className="flex gap-3 w-full justify-end">
              <Button variant="outline" onClick={handleCropCancel} disabled={uploading}>
                Cancelar
              </Button>
              <Button onClick={handleCropConfirm} disabled={uploading}>
                {uploading ? (
                  <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Procesando...</>
                ) : (
                  "Aplicar y subir"
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (type === "avatar") {
    return (
      <>
        <div className={cn("flex items-center gap-6", className)}>
          <div className="relative flex-shrink-0">
            <div className="h-20 w-20 rounded-full overflow-hidden bg-muted border-2 border-border">
              {displayPreview ? (
                <img src={displayPreview} alt="Avatar" className="h-full w-full object-cover"
                  onError={(e) => handleImageError(e, placeholder)} />
              ) : fallback ? (
                <div className="h-full w-full bg-primary/10 flex items-center justify-center">
                  {fallback}
                </div>
              ) : (
                <div className="h-full w-full bg-primary/10 flex items-center justify-center">
                  <Camera className="h-6 w-6 text-primary/40" />
                </div>
              )}
            </div>
            <button type="button" onClick={() => inputRef.current?.click()} disabled={disabled || uploading}
              className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              aria-label="Cambiar imagen">
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
            </button>
          </div>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
            onChange={(e) => { if (e.target.files?.length) handleFiles(e.target.files); }} disabled={disabled || uploading} />
        </div>
        {cropModal}
      </>
    );
  }

  return (
    <>
      <div className={cn("relative", className)}>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple={multiple} className="hidden"
          onChange={(e) => { if (e.target.files?.length) handleFiles(e.target.files); }} disabled={disabled || uploading} />
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "relative rounded-xl overflow-hidden border-2 border-dashed transition-all cursor-pointer group",
            type === "cover" ? "aspect-[21/9]" : "aspect-square max-h-[280px]",
            dragOver ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/30",
            (disabled || uploading) && "pointer-events-none opacity-60"
          )}
        >
          {displayPreview ? (
            <>
              <img src={displayPreview} alt="Preview" className="h-full w-full object-cover"
                onError={(e) => handleImageError(e, PLACEHOLDER_RESTAURANT)} />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-center">
                  <Camera className="h-8 w-8 text-white mx-auto" />
                  <p className="text-xs text-white mt-1">Cambiar foto</p>
                </div>
              </div>
              <button type="button" onClick={(e) => { e.stopPropagation(); setLocalPreview(null); if (inputRef.current) inputRef.current.value = ""; }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10">
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground p-4">
              {uploading ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <Upload className="h-8 w-8" />
              )}
              <p className="text-sm font-medium">
                {uploading ? "Subiendo..." : "Arrastra o haz clic para subir"}
              </p>
              <p className="text-xs text-center">JPG, PNG o WebP · Máx {type === "avatar" ? "2" : "5"}MB</p>
            </div>
          )}
          {uploading && displayPreview && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}
          {compressionResult && !uploading && (
            <div className="absolute bottom-0 left-0 right-0 bg-success/90 text-success-foreground text-[11px] px-3 py-1.5 flex items-center justify-between animate-fade-in">
              <span>Original: {(compressionResult.originalSize / 1024).toFixed(0)}KB</span>
              <span className="font-medium">{compressionResult.savedPercent}% más pequeña</span>
              <span>Final: {(compressionResult.compressedSize / 1024).toFixed(0)}KB</span>
            </div>
          )}
        </div>
        {!displayPreview && !uploading && (
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={disabled}
            className="mt-2">
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            Seleccionar archivo
          </Button>
        )}
      </div>
      {cropModal}
    </>
  );
};
