export interface BrandingConfig {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
}

export const DEFAULT_BRANDING: BrandingConfig = {
  primary_color: "hsl(142, 76%, 36%)",
  secondary_color: "hsl(48, 96%, 53%)",
  accent_color: "hsl(199, 89%, 48%)",
};

export function getRestaurantBranding(restaurante: { branding?: Partial<BrandingConfig> } | null): BrandingConfig {
  if (!restaurante?.branding) return DEFAULT_BRANDING;
  return {
    primary_color: restaurante.branding.primary_color || DEFAULT_BRANDING.primary_color,
    secondary_color: restaurante.branding.secondary_color || DEFAULT_BRANDING.secondary_color,
    accent_color: restaurante.branding.accent_color || DEFAULT_BRANDING.accent_color,
  };
}

export function brandColorWithAlpha(color: string, alpha: number): string {
  if (alpha >= 1) return color;
  if (color.startsWith("hsl")) {
    return color.replace("hsl", "hsla").replace(")", `, ${alpha})`);
  }
  if (color.startsWith("#")) {
    const hex = Math.round(alpha * 255).toString(16).padStart(2, "0");
    return `${color}${hex}`;
  }
  return color;
}
