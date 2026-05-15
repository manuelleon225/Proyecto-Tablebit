export type MesaShape = "circle" | "rectangle" | "booth";
export type MesaEstado = "disponible" | "reservada" | "ocupada" | "limpieza" | "mantenimiento";

export interface MesaItem {
  id: string;
  numero: number;
  capacidad: number;
  shape: MesaShape;
  estado: MesaEstado;
  x: number;
  y: number;
  width?: number;
  height?: number;
  cliente?: string;
  hora?: string;
  notas?: string;
}

export const ESTADO_MESA_CONFIG: Record<MesaEstado, {
  label: string;
  color: string;
  bg: string;
  glow: string;
  dot: string;
}> = {
  disponible: {
    label: "Disponible",
    color: "text-success",
    bg: "bg-success/10 border-success/30",
    glow: "0 0 20px hsl(142, 72%, 35%, 0.2)",
    dot: "bg-success",
  },
  reservada: {
    label: "Reservada",
    color: "text-warning",
    bg: "bg-warning/10 border-warning/30",
    glow: "0 0 20px hsl(38, 92%, 50%, 0.2)",
    dot: "bg-warning",
  },
  ocupada: {
    label: "Ocupada",
    color: "text-destructive",
    bg: "bg-destructive/10 border-destructive/30",
    glow: "0 0 20px hsl(0, 84%, 60%, 0.25)",
    dot: "bg-destructive",
  },
  limpieza: {
    label: "Limpieza",
    color: "text-primary",
    bg: "bg-primary/10 border-primary/30",
    glow: "0 0 20px hsl(160, 84%, 39%, 0.15)",
    dot: "bg-primary",
  },
  mantenimiento: {
    label: "Mantenimiento",
    color: "text-muted-foreground",
    bg: "bg-muted/50 border-border",
    glow: "none",
    dot: "bg-muted-foreground",
  },
};

export const generateMockMesas = (): MesaItem[] => {
  const mesas: MesaItem[] = [];
  const estados: MesaEstado[] = ["disponible", "reservada", "ocupada", "limpieza", "disponible", "disponible"];
  const shapes: MesaShape[] = ["circle", "rectangle", "booth", "circle", "rectangle", "circle"];

  for (let i = 1; i <= 18; i++) {
    const col = (i - 1) % 6;
    const row = Math.floor((i - 1) / 6);
    const cap = [2, 4, 4, 6, 2, 8, 4, 6, 2, 4, 6, 2, 8, 4, 4, 6, 2, 4][i - 1] || 4;
    const idx = i % estados.length;

    mesas.push({
      id: `mesa-${i}`,
      numero: i,
      capacidad: cap,
      shape: i > 12 ? "booth" : i % 3 === 0 ? "rectangle" : "circle",
      estado: i % 7 === 0 ? "mantenimiento" : i % 5 === 0 ? "ocupada" : i % 3 === 0 ? "reservada" : "disponible",
      x: 40 + col * 160 + Math.random() * 10,
      y: 40 + row * 140 + Math.random() * 10,
      width: cap >= 6 ? 80 : 64,
      height: cap >= 6 ? 80 : 64,
      cliente: i % 3 === 0 ? ["Ana M.", "Carlos L.", "María G.", "Pedro R.", "Laura F.", "Diego S."][i % 6] : undefined,
      hora: i % 3 === 0 ? `${18 + (i % 4)}:00` : undefined,
    });
  }
  return mesas;
};
