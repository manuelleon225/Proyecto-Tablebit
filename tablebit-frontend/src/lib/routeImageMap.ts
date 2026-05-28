export const ROUTE_IMAGE_MAP: Record<string, { section: string; priority: string }[]> = {
  "/dashboard": [
    { section: "analytics", priority: "HERO" },
    { section: "reservas", priority: "ABOVE_FOLD" },
    { section: "mesas", priority: "VISIBLE" },
  ],
  "/dashboard/media": [
    { section: "gallery", priority: "HERO" },
    { section: "logos", priority: "ABOVE_FOLD" },
    { section: "banners", priority: "ABOVE_FOLD" },
  ],
  "/dashboard/branding": [
    { section: "previews", priority: "VISIBLE" },
  ],
  "/restaurante/": [
    { section: "hero", priority: "HERO" },
    { section: "cards", priority: "VISIBLE" },
    { section: "gallery", priority: "BELOW_FOLD" },
  ],
  "/restaurantes": [
    { section: "cards", priority: "VISIBLE" },
  ],
};

export function getRoutePriorityMap(path: string): { section: string; priority: string }[] {
  for (const [route, sections] of Object.entries(ROUTE_IMAGE_MAP)) {
    if (path.startsWith(route) || path === route) return sections;
  }
  return [];
}
