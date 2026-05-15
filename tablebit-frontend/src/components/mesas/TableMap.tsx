import { useState, useCallback, useMemo } from "react";
import {
  DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent, type DragStartEvent,
} from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import { TableShape } from "./TableShape";
import { TableToolbar } from "./TableToolbar";
import { TableModal } from "./TableModal";
import { type MesaItem, type MesaEstado, generateMockMesas } from "./types";

export const TableMap = () => {
  const [mesas, setMesas] = useState<MesaItem[]>(generateMockMesas);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedMesa, setSelectedMesa] = useState<MesaItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [filterEstado, setFilterEstado] = useState<MesaEstado | "todas">("todas");
  const [fullscreen, setFullscreen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, delta } = event;
    setMesas((prev) =>
      prev.map((m) =>
        m.id === active.id ? { ...m, x: m.x + delta.x, y: m.y + delta.y } : m
      )
    );
    setActiveId(null);
  }, []);

  const filteredMesas = useMemo(
    () => filterEstado === "todas" ? mesas : mesas.filter((m) => m.estado === filterEstado),
    [mesas, filterEstado]
  );

  const activeMesa = useMemo(() => mesas.find((m) => m.id === activeId), [mesas, activeId]);

  const handleMesaClick = (mesa: MesaItem) => {
    setSelectedMesa(mesa);
    setShowModal(true);
  };

  const handleEstadoChange = (id: string, estado: MesaEstado) => {
    setMesas((prev) => prev.map((m) => (m.id === id ? { ...m, estado } : m)));
    setShowModal(false);
  };

  return (
    <div className={`relative ${fullscreen ? "fixed inset-0 z-50 bg-background" : ""}`}>
      <TableToolbar zoom={zoom} setZoom={setZoom} filterEstado={filterEstado} setFilterEstado={setFilterEstado}
        fullscreen={fullscreen} setFullscreen={setFullscreen} />

      <div
        className="relative overflow-auto rounded-xl border border-border/50 bg-card/30 shadow-card"
        style={{ height: fullscreen ? "calc(100vh - 60px)" : "560px" }}
      >
        <div
          className="relative min-w-[1000px] min-h-[500px]"
          style={{ transform: `scale(${zoom})`, transformOrigin: "top left", transition: "transform 0.2s" }}
        >
          {/* Grid background */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.3 }}>
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Room label */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-muted/50 border border-border/50 text-[10px] text-muted-foreground font-medium">
            SALÓN PRINCIPAL
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

        {/* Empty state */}
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
