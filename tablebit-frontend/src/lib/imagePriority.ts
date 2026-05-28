export type ImagePriority = "HERO" | "ABOVE_FOLD" | "VISIBLE" | "BELOW_FOLD" | "HIDDEN";

const PRIORITY_ORDER: Record<ImagePriority, number> = {
  HERO: 0,
  ABOVE_FOLD: 1,
  VISIBLE: 2,
  BELOW_FOLD: 3,
  HIDDEN: 4,
};

export function comparePriority(a: ImagePriority, b: ImagePriority): number {
  return PRIORITY_ORDER[a] - PRIORITY_ORDER[b];
}

export function isHigherPriority(a: ImagePriority, b: ImagePriority): boolean {
  return PRIORITY_ORDER[a] < PRIORITY_ORDER[b];
}

const HERO_ROUTES = ["/dashboard", "/restaurante/", "/restaurantes/"];

export function getRoutePriority(path: string): ImagePriority {
  if (HERO_ROUTES.some((r) => path.startsWith(r) || path === r)) return "HERO";
  return "ABOVE_FOLD";
}

export function getViewportPriority(
  rect: DOMRect | null,
  viewportHeight: number,
  scrollY: number
): ImagePriority {
  if (!rect) return "HIDDEN";
  const top = rect.top + scrollY;
  const bottom = rect.bottom + scrollY;
  const viewTop = scrollY;
  const viewBottom = scrollY + viewportHeight;

  if (top >= viewTop && bottom <= viewBottom) return "VISIBLE";
  if (bottom < viewTop) return "HIDDEN";
  if (top > viewBottom && top < viewBottom + viewportHeight) return "BELOW_FOLD";
  if (top <= viewTop && bottom >= viewTop) return "ABOVE_FOLD";
  return "HIDDEN";
}
