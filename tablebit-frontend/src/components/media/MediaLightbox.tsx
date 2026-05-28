import { useEffect, useCallback, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { getImageUrl } from "@/lib/image";

interface MediaLightboxProps {
  images: { id: number; ruta: string; nombre_original?: string }[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

const NAV_THROTTLE = 300;

const MediaLightbox = ({ images, currentIndex, onClose, onNavigate }: MediaLightboxProps) => {
  const current = images[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;
  const navLock = useRef(false);
  const preloadRefs = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    preloadRefs.current.forEach((img) => { img.onload = null; img.src = ""; });
    const preload: HTMLImageElement[] = [];
    [currentIndex - 1, currentIndex + 1, currentIndex - 2, currentIndex + 2].forEach((i) => {
      if (i >= 0 && i < images.length) {
        const img = new Image();
        img.src = getImageUrl(images[i].ruta) || "";
        preload.push(img);
      }
    });
    preloadRefs.current = preload;
  }, [currentIndex, images]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && navLock.current) return;
    if (e.key === "ArrowLeft" && hasPrev) {
      navLock.current = true;
      onNavigate(currentIndex - 1);
      setTimeout(() => { navLock.current = false; }, NAV_THROTTLE);
    }
    if (e.key === "ArrowRight" && hasNext) {
      navLock.current = true;
      onNavigate(currentIndex + 1);
      setTimeout(() => { navLock.current = false; }, NAV_THROTTLE);
    }
  }, [onClose, onNavigate, currentIndex, hasPrev, hasNext]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  const handleNav = (dir: number) => {
    if (navLock.current) return;
    navLock.current = true;
    onNavigate(currentIndex + dir);
    setTimeout(() => { navLock.current = false; }, NAV_THROTTLE);
  };

  if (!current) return null;

  const currentUrl = getImageUrl(current.ruta) || "";

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={onClose}
      role="dialog" aria-modal="true" aria-label="Visor de imágenes">
      <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10" aria-label="Cerrar">
        <X className="h-6 w-6" />
      </button>

      {hasPrev && (
        <button onClick={(e) => { e.stopPropagation(); handleNav(-1); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10" aria-label="Anterior">
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {hasNext && (
        <button onClick={(e) => { e.stopPropagation(); handleNav(1); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10" aria-label="Siguiente">
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      <div className="flex flex-col items-center gap-3 max-h-[90vh] max-w-[95vw]" onClick={(e) => e.stopPropagation()}>
        <img src={currentUrl} alt={current.nombre_original || "Imagen"}
          className="max-h-[80vh] max-w-[90vw] rounded-xl object-contain" />
        {current.nombre_original && (
          <p className="text-xs text-white/60 truncate max-w-full px-4">{current.nombre_original}</p>
        )}
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
        {images.map((_, i) => (
          <button key={i} onClick={() => onNavigate(i)}
            className={`h-1.5 rounded-full transition-all ${i === currentIndex ? "w-6 bg-white" : "w-1.5 bg-white/40"}`}
            aria-label={`Ir a imagen ${i + 1}`} />
        ))}
      </div>
    </div>
  );
};

export default MediaLightbox;
