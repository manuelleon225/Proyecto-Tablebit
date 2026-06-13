import { useState } from "react";
import { getImageUrl, PLACEHOLDER_RESTAURANT, PLACEHOLDER_LOGO, PLACEHOLDER_AVATAR, handleImageError } from "@/lib/image";
import { MediaUploader } from "@/components/media/MediaUploader";
import { Button } from "@/components/ui/button";
import { Trash2, Upload, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

type MediaType = "avatar" | "logo" | "cover" | "banner" | "gallery";
type CropShape = "rect" | "round";

interface MediaSectionProps {
  title: string;
  description?: string;
  imageUrl?: string | null;
  type: MediaType;
  aspectRatio?: number;
  cropShape?: CropShape;
  onUploaded: (files: File[]) => Promise<void>;
  onDeleted?: () => Promise<void>;
  allowDelete?: boolean;
  placeholder?: string;
  className?: string;
}

const aspectClasses: Record<MediaType, string> = {
  avatar: "h-20 w-20 rounded-full",
  logo: "h-24 w-24 rounded-xl",
  cover: "aspect-[16/9]",
  banner: "aspect-[21/9]",
  gallery: "aspect-square",
};

const MediaSection = ({
  title,
  description,
  imageUrl,
  type,
  aspectRatio,
  cropShape,
  onUploaded,
  onDeleted,
  allowDelete = true,
  placeholder,
  className,
}: MediaSectionProps) => {
  const [uploading, setUploading] = useState(false);
  const [showUploader, setShowUploader] = useState(false);

  const resolvedUrl = getImageUrl(imageUrl);
  const resolvedAspect = aspectRatio ?? (type === "avatar" || type === "logo" ? 1 : type === "banner" ? 21/9 : type === "cover" ? 16/9 : undefined);
  const resolvedShape = cropShape ?? (type === "avatar" || type === "logo" ? "round" : "rect");
  const fallbackImg = type === "avatar" ? PLACEHOLDER_AVATAR : type === "logo" ? PLACEHOLDER_LOGO : PLACEHOLDER_RESTAURANT;
  const containerClass = aspectClasses[type];

  const handleUpload = async (files: File[]) => {
    setUploading(true);
    try {
      await onUploaded(files);
      setShowUploader(false);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={cn("rounded-xl border border-border/50 bg-card p-5 space-y-3", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-display text-sm font-semibold">{title}</h3>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {!showUploader && (
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setShowUploader(true)} disabled={uploading}>
              <Upload className="h-3.5 w-3.5" />
              {resolvedUrl ? "Cambiar" : "Subir"}
            </Button>
          )}
          {allowDelete && resolvedUrl && !showUploader && (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={onDeleted} aria-label={`Eliminar ${title}`}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {showUploader ? (
        <MediaUploader
          type={type as any}
          preview={resolvedUrl || undefined}
          onUpload={handleUpload}
          enableCrop
          cropAspect={resolvedAspect}
          cropShape={resolvedShape}
          disabled={uploading}
        />
      ) : (
        <div className={cn("relative overflow-hidden rounded-lg bg-muted/30 border border-border/30 group", containerClass)}>
          {resolvedUrl ? (
            <img
              src={resolvedUrl}
              alt={title}
              className="h-full w-full object-cover"
              onError={(e) => handleImageError(e, fallbackImg)}
            />
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center gap-1.5 text-muted-foreground">
              <Camera className="h-6 w-6 opacity-40" />
              <p className="text-xs">Sin imagen</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaSection;
