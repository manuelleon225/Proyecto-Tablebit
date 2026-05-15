import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Clock, MessageSquare } from "lucide-react";
import { type MesaItem, type MesaEstado, ESTADO_MESA_CONFIG } from "./types";
import { cn } from "@/lib/utils";

interface Props {
  mesa: MesaItem;
  onClose: () => void;
  onEstadoChange: (id: string, estado: MesaEstado) => void;
}

export const TableModal = ({ mesa, onClose, onEstadoChange }: Props) => {
  const cfg = ESTADO_MESA_CONFIG[mesa.estado];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full max-w-sm rounded-2xl border border-border/50 bg-card shadow-modal p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center border-2", cfg.bg)}>
                <span className="font-display text-lg font-bold">{mesa.numero}</span>
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold">Mesa {mesa.numero}</h3>
                <span className={cn("inline-flex items-center gap-1 text-xs font-medium mt-0.5", cfg.color)}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
                  {cfg.label}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div className="space-y-3 mb-5">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>Capacidad: <strong>{mesa.capacidad} personas</strong></span>
            </div>
            {mesa.hora && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Próxima reserva: <strong>{mesa.hora}</strong></span>
              </div>
            )}
            {mesa.cliente && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>Cliente: <strong>{mesa.cliente}</strong></span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span>Forma: <strong className="capitalize">{mesa.shape === "booth" ? "Cabina" : mesa.shape === "circle" ? "Redonda" : "Rectangular"}</strong></span>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Cambiar estado:</p>
            <div className="grid grid-cols-2 gap-1.5">
              {(["disponible", "reservada", "ocupada", "limpieza", "mantenimiento"] as MesaEstado[]).map((estado) => {
                const c = ESTADO_MESA_CONFIG[estado];
                return (
                  <button key={estado}
                    onClick={() => onEstadoChange(mesa.id, estado)}
                    disabled={estado === mesa.estado}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all border",
                      estado === mesa.estado
                        ? "bg-primary/10 border-primary/30 text-primary cursor-default"
                        : "bg-card border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} />
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
