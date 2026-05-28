const SVG_NS = "data:image/svg+xml,";

function encodeForDataUrl(svg: string): string {
  return SVG_NS + encodeURIComponent(svg);
}

function createSvgRect(width: number, height: number, fill: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="${width}" height="${height}" fill="${fill}"/></svg>`;
}

export const DEFAULT_BLUR_PLACEHOLDER = encodeForDataUrl(
  createSvgRect(100, 100, "#e2e8f0")
);

export function generateBlurDataUrl(color = "#cbd5e1"): string {
  return encodeForDataUrl(createSvgRect(100, 100, color));
}
