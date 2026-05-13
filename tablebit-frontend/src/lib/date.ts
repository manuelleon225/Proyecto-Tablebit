export type DateFormat = "short" | "long";

const LOCALE = "es-ES";

const FORMAT_OPTIONS: Record<DateFormat, Intl.DateTimeFormatOptions> = {
  short: { day: "2-digit", month: "short", year: "numeric" },
  long: { weekday: "short", day: "numeric", month: "short", year: "numeric" },
};

export function formatDate(
  fecha: string | null | undefined,
  format: DateFormat = "short"
): string {
  if (!fecha) return "Fecha no disponible";

  const d = new Date(fecha);
  if (isNaN(d.getTime())) return "Fecha no disponible";

  return d.toLocaleDateString(LOCALE, FORMAT_OPTIONS[format]);
}
