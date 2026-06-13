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

import { getImageCanvasUrl } from "./image";

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

interface RGB { r: number; g: number; b: number }
interface HSL { h: number; s: number; l: number }

function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
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
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToString(hsl: HSL): string {
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}

function euclideanDist(a: HSL, b: HSL): number {
  // Weight hue more than saturation/lightness for perceptual difference
  const hDiff = Math.min(Math.abs(a.h - b.h), 360 - Math.abs(a.h - b.h)) / 360;
  const sDiff = Math.abs(a.s - b.s) / 100;
  const lDiff = Math.abs(a.l - b.l) / 100;
  return Math.sqrt(hDiff * hDiff * 3 + sDiff * sDiff + lDiff * lDiff);
}

function adjustLightness(hsl: HSL, targetLightness: number): HSL {
  return { ...hsl, l: Math.max(10, Math.min(90, targetLightness)) };
}

export function extractColorsFromImageUrl(imageUrl: string): Promise<BrandingConfig> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    const proxyUrl = getImageCanvasUrl(imageUrl) || imageUrl;
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const size = Math.min(img.width, img.height, 200);
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(DEFAULT_BRANDING); return; }

        // Draw centered crop to ensure square sampling
        const sx = Math.max(0, (img.width - size) / 2);
        const sy = Math.max(0, (img.height - size) / 2);
        ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);

        const imageData = ctx.getImageData(0, 0, size, size);
        const pixels = imageData.data;
        const sampled: HSL[] = [];

        // Sample every 4th pixel
        for (let i = 0; i < pixels.length; i += 16) {
          const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2], a = pixels[i + 3];
          if (a < 128) continue; // Skip transparent
          // Skip near-white and near-black
          const brightness = (r + g + b) / 3;
          if (brightness > 240 || brightness < 15) continue;
          sampled.push(rgbToHsl({ r, g, b }));
        }

        if (sampled.length < 5) {
          resolve(DEFAULT_BRANDING);
          return;
        }

        // Cluster by hue into 12 buckets (30 degrees each)
        const buckets: HSL[][] = Array.from({ length: 12 }, () => []);
        for (const pixel of sampled) {
          const bucketIdx = Math.floor(pixel.h / 30) % 12;
          buckets[bucketIdx].push(pixel);
        }

        // Average each bucket
        const clusters: { avg: HSL; count: number }[] = [];
        for (const bucket of buckets) {
          if (bucket.length < sampled.length * 0.02) continue; // At least 2% of samples
          const avgH = Math.round(bucket.reduce((s, p) => s + p.h, 0) / bucket.length);
          const avgS = Math.round(bucket.reduce((s, p) => s + p.s, 0) / bucket.length);
          const avgL = Math.round(bucket.reduce((s, p) => s + p.l, 0) / bucket.length);
          clusters.push({ avg: { h: avgH, s: avgS, l: avgL }, count: bucket.length });
        }

        // Sort by count descending
        clusters.sort((a, b) => b.count - a.count);

        if (clusters.length === 0) { resolve(DEFAULT_BRANDING); return; }

        // Pick primary: most frequent cluster
        const primary = { ...clusters[0].avg };
        // Boost saturation for primary if too muted
        if (primary.s < 25) primary.s = Math.min(primary.s + 20, 90);

        // Pick secondary: most different from primary
        let secondary = clusters.length > 1 ? clusters[1].avg : { h: (primary.h + 180) % 360, s: 70, l: 50 };
        if (clusters.length > 1) {
          let bestDist = 0;
          for (let i = 1; i < clusters.length; i++) {
            const dist = euclideanDist(primary, clusters[i].avg);
            if (dist > bestDist) { bestDist = dist; secondary = clusters[i].avg; }
          }
        }

        // Pick accent: most different from both
        let accent = { h: (primary.h + 90) % 360, s: 80, l: 45 };
        if (clusters.length > 2) {
          let bestDist = 0;
          for (let i = 1; i < clusters.length; i++) {
            const distToPrimary = euclideanDist(primary, clusters[i].avg);
            const distToSecondary = euclideanDist(secondary, clusters[i].avg);
            const minDist = Math.min(distToPrimary, distToSecondary);
            if (minDist > bestDist) { bestDist = minDist; accent = clusters[i].avg; }
          }
        }

        // Boost saturation for accent
        if (accent.s < 30) accent.s = Math.min(accent.s + 25, 90);

        // Ensure min contrast by adjusting lightness
        const result: BrandingConfig = {
          primary_color: hslToString(adjustLightness(primary, primary.l > 60 ? 45 : 42)),
          secondary_color: hslToString(adjustLightness(secondary, secondary.l > 70 ? 55 : 50)),
          accent_color: hslToString(adjustLightness(accent, accent.l > 65 ? 45 : 40)),
        };

        resolve(result);
      } catch {
        resolve(DEFAULT_BRANDING);
      }
    };
    img.onerror = () => resolve(DEFAULT_BRANDING);
    img.src = proxyUrl;
  });
}
