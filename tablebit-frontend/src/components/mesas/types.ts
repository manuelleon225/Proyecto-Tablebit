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


