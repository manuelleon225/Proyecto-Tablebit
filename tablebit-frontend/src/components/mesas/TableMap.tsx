import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent, type DragStartEvent,
} from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import { TableShape } from "./TableShape";
import { TableToolbar } from "./TableToolbar";
import { TableModal } from "./TableModal";
import { useRestaurante } from "@/context/RestauranteContext";
import { restauranteService } from "@/services/restauranteService";
import { type MesaItem, type MesaEstado } from "./types";
import { Loader2, AlertCircle } from "lucide-react";

export const TableMap = () => {
  const { selectedRestauranteId } = useRestaurante();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedMesa, setSelectedMesa] = useState<MesaItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [filterEstado, setFilterEstado] = useState<MesaEstado | "todas">("todas");
  const [fullscreen, setFullscreen] = useState(false);

  // Load real mesas from backend
  const { data: mesasFromApi = [], isLoading, error } = useQuery({
    queryKey: ['mesas-mapa', selectedRestauranteId],
    queryFn: async () => {
      if (!selectedRestauranteId) return [];
      const res = await restauranteService.getMesasRestaurante(selectedRestauranteId);
      return res.data;
    },
    enabled: !!selectedRestauranteId,
    staleTime: 30 * 1000,
  });

  // Separate state for positions (for drag & drop)
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});

  // Convert API mesas to MesaItem format
  const mesas: MesaItem[] = useMemo(() => {
    return mesasFromApi.map((m: any, i: number) => {
      const defaultPos = { x: 40 + (i % 5) * 160, y: 40 + Math.floor(i / 5) * 140 };
      const savedPos = positions[`mesa-${m.id}`] || {};
      return {
        id: `mesa-${m.id}`,
        numero: m.numero,
        capacidad: m.capacidad,
        shape: (m.forma || (m.capacidad <= 2 ? "circle" : m.capacidad >= 8 ? "rectangle" : "circle")) as any,
        estado: (m.estado === "disponible" ? "disponible" :
                 m.estado === "ocupada" ? "ocupada" :
                 m.estado === "mantenimiento" ? "mantenimiento" : "disponible") as MesaEstado,
        x: savedPos.x ?? m.pos_x ?? defaultPos.x,
        y: savedPos.y ?? m.pos_y ?? defaultPos.y,
        width: m.capacidad >= 6 ? 80 : 64,
        height: m.capacidad >= 6 ? 80 : 64,
      };
    });
  }, [mesasFromApi, positions]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, delta } = event;
    const activeMesa = mesas.find((m) => m.id === active.id);
    if (!activeMesa) return;
    setPositions((prev) => ({
      ...prev,
      [String(active.id)]: {
        x: (prev[String(active.id)]?.x ?? activeMesa.x) + delta.x,
        y: (prev[String(active.id)]?.y ?? activeMesa.y) + delta.y,
      },
    }));
    setActiveId(null);
  }, [mesas]);

  const filteredMesas = useMemo(
    () => filterEstado === "todas" ? mesas : mesas.filter((m) => m.estado === filterEstado),
    [mesas, filterEstado]
  );

  const activeMesa = useMemo(() => mesas.find((m) => m.id === activeId), [mesas, activeId]);

  const handleMesaClick = (mesa: MesaItem) => {
    setSelectedMesa(mesa);
    setShowModal(true);
  };

  const handleEstadoChange = (_id: string, _estado: MesaEstado) => {
    setShowModal(false);
    // TODO: persist estado change to backend
  };

  if (!selectedRestauranteId) {
    return <div className="text-center py-16 text-muted-foreground">Selecciona un restaurante para ver sus mesas</div>;
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-96 text-destructive gap-2"><AlertCircle className="h-5 w-5" /> Error al cargar mesas</div>;
  }

  return (
    <div className={`relative ${fullscreen ? "fixed inset-0 z-50 bg-background" : ""}`}>
      <TableToolbar zoom={zoom} setZoom={setZoom} filterEstado={filterEstado} setFilterEstado={setFilterEstado}
        fullscreen={fullscreen} setFullscreen={setFullscreen} />

      <div className="relative overflow-auto rounded-xl border border-border/50 bg-card/30 shadow-card"
        style={{ height: fullscreen ? "calc(100vh - 60px)" : "560px" }}>
        <div className="relative min-w-[1000px] min-h-[500px]"
          style={{ transform: `scale(${zoom})`, transformOrigin: "top left", transition: "transform 0.2s" }}>
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.3 }}>
            <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" />
            </pattern></defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          <div className="absolute top-2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-muted/50 border border-border/50 text-[10px] text-muted-foreground font-medium">
            MESAS DEL RESTAURANTE
          </div>
          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
            <AnimatePresence>
              {filteredMesas.map((mesa) => (
                <TableShape key={mesa.id} mesa={mesa} onClick={() => handleMesaClick(mesa)} />
              ))}
            </AnimatePresence>
            <DragOverlay>
              {activeMesa && <TableShape mesa={activeMesa} isDragging />}
            </DragOverlay>
          </DndContext>
        </div>
        {filteredMesas.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">No hay mesas con ese estado</p>
          </div>
        )}
      </div>

      {showModal && selectedMesa && (
        <TableModal mesa={selectedMesa} onClose={() => setShowModal(false)} onEstadoChange={handleEstadoChange} />
      )}
    </div>
  );
};
