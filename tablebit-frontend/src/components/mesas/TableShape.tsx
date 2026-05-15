import { motion } from "framer-motion";
import { type MesaItem, ESTADO_MESA_CONFIG } from "./types";
import { cn } from "@/lib/utils";

interface Props {
  mesa: MesaItem;
  isDragging?: boolean;
  onClick?: () => void;
  dragHandleProps?: any;
}

export const TableShape = ({ mesa, isDragging, onClick, dragHandleProps }: Props) => {
  const cfg = ESTADO_MESA_CONFIG[mesa.estado];

  const baseClasses = cn(
    "absolute flex flex-col items-center justify-center cursor-pointer",
    "transition-all duration-200 select-none",
    cfg.bg,
    "border-2",
    isDragging && "shadow-elevated z-50 scale-105",
    !isDragging && "hover:z-10"
  );

  const style: React.CSSProperties = {
    left: mesa.x,
    top: mesa.y,
    width: mesa.width || 64,
    height: mesa.height || 64,
    borderRadius: mesa.shape === "circle" ? "50%" : mesa.shape === "booth" ? "12px" : "8px",
    boxShadow: isDragging ? "0 20px 40px rgba(0,0,0,0.15)" : cfg.glow !== "none" ? cfg.glow : undefined,
    ...(mesa.shape === "booth" ? { borderTopLeftRadius: "24px", borderBottomRightRadius: "24px" } : {}),
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className={baseClasses}
      style={style}
      onClick={onClick}
      whileHover={{ scale: 1.08, transition: { duration: 0.15 } }}
      whileTap={{ scale: 0.95 }}
      {...dragHandleProps}
    >
      {/* Pulse ring for occupied */}
      {(mesa.estado === "ocupada" || mesa.estado === "reservada") && (
        <span className={cn(
          "absolute inset-0 rounded-[inherit] animate-ping opacity-20",
          mesa.estado === "ocupada" ? "bg-destructive" : "bg-warning"
        )} />
      )}

      {/* Mesa number */}
      <span className={cn(
        "font-display text-sm font-bold leading-none z-10",
        mesa.estado === "disponible" ? "text-success" : "text-foreground"
      )}>
        {mesa.numero}
      </span>

      {/* Capacity icon */}
      <span className="text-[9px] text-muted-foreground mt-0.5 z-10 leading-none">
        {mesa.capacidad}
        <svg className="inline-block h-2.5 w-2.5 ml-0.5 -mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      </span>

      {/* Client indicator */}
      {mesa.cliente && (
        <div className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-foreground/10 border border-border flex items-center justify-center">
          <span className="text-[7px] font-bold text-foreground">{mesa.cliente.charAt(0)}</span>
        </div>
      )}
    </motion.div>
  );
};
