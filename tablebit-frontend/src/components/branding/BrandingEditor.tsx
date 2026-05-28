import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RotateCcw, Palette, Check, ChevronRight } from "lucide-react";
import { DEFAULT_BRANDING, brandColorWithAlpha } from "@/lib/branding";
import { useBranding } from "@/context/BrandingContext";
import type { BrandingConfig } from "@/lib/branding";

interface Props {
  branding?: Partial<BrandingConfig>;
  onChange: (branding: Partial<BrandingConfig>) => void;
}

interface Preset {
  id: string;
  name: string;
  description: string;
  branding: BrandingConfig;
}

const PRESETS: Preset[] = [
  {
    id: "modern-green",
    name: "Modern Green",
    description: "Fresco y natural",
    branding: {
      primary_color: "hsl(142, 76%, 36%)",
      secondary_color: "hsl(48, 96%, 53%)",
      accent_color: "hsl(199, 89%, 48%)",
    },
  },
  {
    id: "elegant-dark",
    name: "Elegant Dark",
    description: "Sobrio y sofisticado",
    branding: {
      primary_color: "hsl(260, 60%, 45%)",
      secondary_color: "hsl(30, 80%, 55%)",
      accent_color: "hsl(190, 90%, 40%)",
    },
  },
  {
    id: "luxury-gold",
    name: "Luxury Gold",
    description: "Premium y exclusivo",
    branding: {
      primary_color: "hsl(38, 92%, 50%)",
      secondary_color: "hsl(0, 0%, 20%)",
      accent_color: "hsl(142, 50%, 45%)",
    },
  },
  {
    id: "ocean-blue",
    name: "Ocean Blue",
    description: "Fresco y profesional",
    branding: {
      primary_color: "hsl(210, 80%, 45%)",
      secondary_color: "hsl(48, 96%, 53%)",
      accent_color: "hsl(170, 75%, 40%)",
    },
  },
  {
    id: "minimal-white",
    name: "Minimal White",
    description: "Limpio y moderno",
    branding: {
      primary_color: "hsl(0, 0%, 15%)",
      secondary_color: "hsl(210, 80%, 45%)",
      accent_color: "hsl(0, 0%, 60%)",
    },
  },
];

function hslToHex(hsl: string): string {
  const match = hsl.match(/hsl\(\s*(\d+),\s*(\d+)%,\s*(\d+)%\s*\)/);
  if (!match) return "#22c55e";
  const h = parseInt(match[1]) / 360;
  const s = parseInt(match[2]) / 100;
  const l = parseInt(match[3]) / 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h * 12) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * Math.max(0, Math.min(1, color)));
  };
  return `#${[f(0), f(8), f(4)].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

const labels: { key: keyof BrandingConfig; label: string; desc: string }[] = [
  { key: "primary_color", label: "Color primario", desc: "Botones, enlaces, acentos principales" },
  { key: "secondary_color", label: "Color secundario", desc: "Badges, etiquetas, highlights" },
  { key: "accent_color", label: "Color de acento", desc: "Detalles decorativos, iconos" },
];

const PresetCard = ({ preset, active, onClick }: { preset: Preset; active: boolean; onClick: () => void }) => {
  const b = preset.branding;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-xl border-2 p-3 text-left transition-all duration-200 motion-safe:hover:shadow-md motion-safe:hover:-translate-y-0.5 ${
        active ? "border-primary ring-2 ring-primary/20 shadow-md" : "border-border/50 hover:border-border"
      }`}
    >
      {active && (
        <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="h-3 w-3 text-primary-foreground" />
        </span>
      )}
      <div className="flex gap-1.5 mb-2">
        <div className="h-5 w-5 rounded-full ring-1 ring-inset ring-black/10" style={{ backgroundColor: b.primary_color }} />
        <div className="h-5 w-5 rounded-full ring-1 ring-inset ring-black/10" style={{ backgroundColor: b.secondary_color }} />
        <div className="h-5 w-5 rounded-full ring-1 ring-inset ring-black/10" style={{ backgroundColor: b.accent_color }} />
      </div>
      <p className="text-xs font-medium">{preset.name}</p>
      <p className="text-[10px] text-muted-foreground">{preset.description}</p>
    </button>
  );
};

const BrandingEditor = ({ branding, onChange }: Props) => {
  const merged = { ...DEFAULT_BRANDING, ...branding };
  const { setBranding } = useBranding();

  const [hexValues, setHexValues] = useState({
    primary_color: hslToHex(merged.primary_color),
    secondary_color: hslToHex(merged.secondary_color),
    accent_color: hslToHex(merged.accent_color),
  });

  useEffect(() => {
    setHexValues({
      primary_color: hslToHex(merged.primary_color),
      secondary_color: hslToHex(merged.secondary_color),
      accent_color: hslToHex(merged.accent_color),
    });
  }, [branding?.primary_color, branding?.secondary_color, branding?.accent_color]);

  const isPresetActive = (preset: Preset) =>
    merged.primary_color === preset.branding.primary_color &&
    merged.secondary_color === preset.branding.secondary_color &&
    merged.accent_color === preset.branding.accent_color;

  const applyBranding = (partial: Partial<BrandingConfig>) => {
    onChange(partial);
    setBranding(partial);
  };

  const handleColorChange = (key: keyof BrandingConfig, hex: string) => {
    setHexValues((prev) => ({ ...prev, [key]: hex }));
    applyBranding({ [key]: hexToHsl(hex) });
  };

  const handlePreset = (preset: Preset) => {
    setHexValues({
      primary_color: hslToHex(preset.branding.primary_color),
      secondary_color: hslToHex(preset.branding.secondary_color),
      accent_color: hslToHex(preset.branding.accent_color),
    });
    applyBranding(preset.branding);
  };

  const handleReset = () => {
    setHexValues({
      primary_color: hslToHex(DEFAULT_BRANDING.primary_color),
      secondary_color: hslToHex(DEFAULT_BRANDING.secondary_color),
      accent_color: hslToHex(DEFAULT_BRANDING.accent_color),
    });
    applyBranding(DEFAULT_BRANDING);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Colores de marca</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleReset} className="h-7 text-xs gap-1">
          <RotateCcw className="h-3 w-3" /> Restaurar defaults
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {PRESETS.map((preset) => (
          <PresetCard key={preset.id} preset={preset} active={isPresetActive(preset)} onClick={() => handlePreset(preset)} />
        ))}
      </div>

      <Card className="border-dashed">
        <CardContent className="p-4 space-y-4">
          <div className="rounded-lg border border-border/30 bg-card p-3 space-y-3 transition-colors duration-300">
            <div className="space-y-1">
              <p className="text-xs font-semibold" style={{ color: merged.primary_color }}>Vista previa en vivo</p>
              <p className="text-[10px] text-muted-foreground">Así se verán los colores en la interfaz</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div
                className="h-7 rounded-md px-3 text-[11px] font-medium text-white inline-flex items-center justify-center shadow-sm transition-colors duration-300"
                style={{ backgroundColor: merged.primary_color }}
              >
                Botón
              </div>
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium shadow-sm transition-colors duration-300"
                style={{ backgroundColor: brandColorWithAlpha(merged.secondary_color, 0.15), color: merged.secondary_color, border: `1px solid ${brandColorWithAlpha(merged.secondary_color, 0.3)}` }}
              >
                Badge
              </span>
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors duration-300"
                style={{ backgroundColor: brandColorWithAlpha(merged.accent_color, 0.1), color: merged.accent_color }}
              >
                <span className="h-1.5 w-1.5 rounded-full transition-colors duration-300" style={{ backgroundColor: merged.accent_color }} />
                Chip
              </span>
            </div>
            <div
              className="h-8 w-full rounded-md border px-2 text-[11px] text-muted-foreground flex items-center transition-colors duration-300"
              style={{ borderColor: brandColorWithAlpha(merged.primary_color, 0.3) }}
            >
              Input con focus
            </div>
            <div
              className="h-8 rounded-md px-3 text-[11px] font-medium text-white inline-flex items-center gap-1 shadow-md transition-colors duration-300"
              style={{ backgroundColor: merged.primary_color }}
            >
              CTA Principal <ChevronRight className="h-3 w-3" />
            </div>
          </div>

          <div className="h-px bg-border/50" />

          <div className="grid grid-cols-3 gap-3">
            {labels.map(({ key, label, desc }) => (
              <div key={key} className="space-y-1.5">
                <Label className="text-xs">{label}</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={hexValues[key]}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    className="h-8 w-8 rounded cursor-pointer border border-border/50 bg-transparent p-0.5"
                  />
                  <span className="text-[10px] text-muted-foreground truncate">{hexValues[key]}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrandingEditor;
