import { DEFAULT_BRANDING, type BrandingConfig } from "@/lib/branding";
import { brandColorWithAlpha } from "@/lib/branding";

const VAR_MAP: Record<keyof BrandingConfig, string> = {
  primary_color: "--brand-primary",
  secondary_color: "--brand-secondary",
  accent_color: "--brand-accent",
};

function hslToBare(hsl: string): string {
  const m = hsl.match(/hsl\(\s*([\d.]+)\s*,\s*([\d.]+%)\s*,\s*([\d.]+%)\)/);
  return m ? `${m[1]} ${m[2]} ${m[3]}` : "160 84% 39%";
}

export function applyBrandingToCssVars(branding: BrandingConfig): void {
  const root = document.documentElement;
  const barePrimary = hslToBare(branding.primary_color);

  (Object.keys(VAR_MAP) as (keyof BrandingConfig)[]).forEach((key) => {
    root.style.setProperty(VAR_MAP[key], branding[key]);
    root.style.setProperty(`${VAR_MAP[key]}-50`, brandColorWithAlpha(branding[key], 0.5));
    root.style.setProperty(`${VAR_MAP[key]}-20`, brandColorWithAlpha(branding[key], 0.2));
    root.style.setProperty(`${VAR_MAP[key]}-10`, brandColorWithAlpha(branding[key], 0.1));
  });

  root.style.setProperty("--primary", barePrimary);
  root.style.setProperty("--primary-foreground", "0 0% 100%");
  root.style.setProperty("--ring", barePrimary);
  root.style.setProperty("--sidebar-ring", barePrimary);
  root.style.setProperty("--sidebar-primary", "0 0% 100%");
}

export function resetBranding(): void {
  applyBrandingToCssVars(DEFAULT_BRANDING);
}
