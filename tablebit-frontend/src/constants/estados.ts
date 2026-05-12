export type ReservaEstado = 'pendiente' | 'confirmada' | 'completada' | 'cancelada' | 'no_show';

export interface EstadoConfig {
  label: string;
  color: string;
  bg: string;
}

export const ESTADO_CONFIG: Record<ReservaEstado, EstadoConfig> = {
  pendiente: { label: 'Pendiente', color: 'text-warning', bg: 'bg-warning/10 border-warning/20' },
  confirmada: { label: 'Confirmada', color: 'text-success', bg: 'bg-success/10 border-success/20' },
  completada: { label: 'Completada', color: 'text-indigo-500', bg: 'bg-indigo-500/10 border-indigo-500/20' },
  cancelada: { label: 'Cancelada', color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/20' },
  no_show: { label: 'No Show', color: 'text-muted-foreground', bg: 'bg-muted/50 border-border' },
};
