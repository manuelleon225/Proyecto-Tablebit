import { ZoomIn, ZoomOut, Maximize2, Minimize2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type MesaEstado, ESTADO_MESA_CONFIG, generateMockMesas } from "./types";
import { motion } from "framer-motion";

interface Props {
  zoom: number;
  setZoom: (v: number) => void;
  filterEstado: MesaEstado | "todas";
  setFilterEstado: (v: MesaEstado | "todas") => void;
  fullscreen: boolean;
  setFullscreen: (v: boolean) => void;
}

export const TableToolbar = ({ zoom, setZoom, filterEstado, setFilterEstado, fullscreen, setFullscreen }: Props) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center justify-between gap-3 mb-4 flex-wrap"
  >
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-xs font-medium text-muted-foreground mr-1">Estado:</span>
      {(["todas", "disponible", "reservada", "ocupada", "limpieza", "mantenimiento"] as const).map((e) => (
        <button key={e}
          onClick={() => setFilterEstado(e)}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
            filterEstado === e
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted/50 text-muted-foreground hover:bg-muted"
          }`}
        >
          {e === "todas" ? "Todas" : ESTADO_MESA_CONFIG[e as MesaEstado]?.label || e}
        </button>
      ))}
    </div>

    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5 mr-2">
        {(["disponible", "reservada", "ocupada", "limpieza", "mantenimiento"] as const).map((e) => (
          <div key={e} className="flex items-center gap-1 px-1.5">
            <div className={`h-2 w-2 rounded-full ${ESTADO_MESA_CONFIG[e as MesaEstado]?.dot || "bg-muted"}`} />
            <span className="text-[10px] text-muted-foreground hidden sm:inline">{ESTADO_MESA_CONFIG[e as MesaEstado]?.label}</span>
          </div>
        ))}
      </div>

      <div className="w-px h-5 bg-border mx-1" />

      <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="Zoom out">
        <ZoomOut className="h-4 w-4 text-muted-foreground" />
      </button>
      <span className="text-xs font-medium text-muted-foreground w-10 text-center">{Math.round(zoom * 100)}%</span>
      <button onClick={() => setZoom(Math.min(2, zoom + 0.1))} className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="Zoom in">
        <ZoomIn className="h-4 w-4 text-muted-foreground" />
      </button>
      <button onClick={() => setZoom(1)} className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="Reset zoom">
        <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      <div className="w-px h-5 bg-border mx-1" />

      <button onClick={() => setFullscreen(!fullscreen)} className="p-1.5 rounded-lg hover:bg-muted transition-colors" title={fullscreen ? "Salir" : "Pantalla completa"}>
        {fullscreen ? <Minimize2 className="h-4 w-4 text-muted-foreground" /> : <Maximize2 className="h-4 w-4 text-muted-foreground" />}
      </button>
    </div>
  </motion.div>
);
