import { MapPin, ExternalLink, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  lat?: string | null;
  lng?: string | null;
  nombre: string;
  direccion?: string | null;
  className?: string;
}

export const RestaurantMap = ({ lat, lng, nombre, direccion, className }: Props) => {
  if (!lat || !lng) {
    return (
      <div className={`rounded-xl border border-dashed border-border/30 bg-card/30 p-8 text-center ${className || ""}`}>
        <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground/20" />
        <p className="text-sm text-muted-foreground">Ubicación no disponible</p>
      </div>
    );
  }

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  const wazeUrl = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;

  const copyAddress = () => {
    if (direccion) {
      navigator.clipboard.writeText(direccion);
      toast.success("Dirección copiada");
    }
  };

  return (
    <div className={`space-y-3 ${className || ""}`}>
      <div className="h-48 sm:h-56 rounded-xl overflow-hidden bg-muted border border-border/50 relative">
        <img
          src={`https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=800x400&markers=color:red%7C${lat},${lng}&key=YOUR_KEY`}
          alt={`Mapa de ${nombre}`}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-black/5" />
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" asChild className="flex-1 h-9 text-xs">
          <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Google Maps
          </a>
        </Button>
        <Button variant="outline" size="sm" asChild className="flex-1 h-9 text-xs">
          <a href={wazeUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Waze
          </a>
        </Button>
        {direccion && (
          <Button variant="outline" size="sm" onClick={copyAddress} className="h-9 text-xs" aria-label="Copiar dirección">
            <Copy className="h-3.5 w-3.5 mr-1.5" /> Copiar
          </Button>
        )}
      </div>
    </div>
  );
};
