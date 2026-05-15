import { useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Clock, Users, Phone, X, UserPlus, ArrowUpDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WaitlistEntry {
  id: string;
  name: string;
  phone: string;
  personas: number;
  tiempo: number;
  prioridad: "normal" | "vip" | "frecuente";
  llegada: Date;
}

const generateMock = (): WaitlistEntry[] => [
  { id: "1", name: "Ana Martínez", phone: "+57 300 123 4567", personas: 4, tiempo: 15, prioridad: "vip", llegada: new Date(Date.now() - 1000 * 60 * 5) },
  { id: "2", name: "Carlos López", phone: "+57 310 987 6543", personas: 2, tiempo: 25, prioridad: "frecuente", llegada: new Date(Date.now() - 1000 * 60 * 10) },
  { id: "3", name: "María García", phone: "+57 315 456 7890", personas: 6, tiempo: 35, prioridad: "normal", llegada: new Date(Date.now() - 1000 * 60 * 3) },
  { id: "4", name: "Pedro Rodríguez", phone: "+57 320 789 0123", personas: 3, tiempo: 20, prioridad: "normal", llegada: new Date(Date.now() - 1000 * 60 * 8) },
];

const prioridadConfig = {
  vip: { label: "VIP", color: "text-warning bg-warning/10 border-warning/20" },
  frecuente: { label: "Frecuente", color: "text-primary bg-primary/10 border-primary/20" },
  normal: { label: "Normal", color: "text-muted-foreground bg-muted/30 border-border" },
};

export const Waitlist = () => {
  const [entries, setEntries] = useState<WaitlistEntry[]>(generateMock);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPersonas, setNewPersonas] = useState(2);

  const addEntry = () => {
    if (!newName.trim()) return;
    setEntries((prev) => [
      ...prev,
      { id: String(Date.now()), name: newName.trim(), phone: "", personas: newPersonas, tiempo: Math.floor(Math.random() * 20) + 10, prioridad: "normal", llegada: new Date() },
    ]);
    setNewName("");
    setShowForm(false);
  };

  const removeEntry = (id: string) => setEntries((prev) => prev.filter((e) => e.id !== id));

  return (
    <div className="rounded-xl border border-border/50 bg-card shadow-card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
        <div>
          <h3 className="font-display text-sm font-semibold">Lista de espera</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{entries.length} grupo{entries.length !== 1 ? "s" : ""} esperando</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)} className="h-8">
          <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Agregar
        </Button>
      </div>

      {showForm && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="overflow-hidden border-b border-border/50">
          <div className="p-4 space-y-3">
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nombre del cliente" className="w-full h-9 px-3 rounded-lg bg-muted/50 border border-border/50 text-sm focus:outline-none focus:border-primary/50 transition-colors" />
            <div className="flex gap-2">
              <input type="number" min={1} max={20} value={newPersonas} onChange={(e) => setNewPersonas(Number(e.target.value))} className="w-20 h-9 px-3 rounded-lg bg-muted/50 border border-border/50 text-sm focus:outline-none focus:border-primary/50" />
              <Button size="sm" onClick={addEntry} className="flex-1 h-9">Agregar a lista</Button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="divide-y divide-border/30">
        <AnimatePresence>
          {entries.map((entry, i) => {
            const cfg = prioridadConfig[entry.prioridad];
            return (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3 px-5 py-3 hover:bg-muted/20 transition-colors group"
              >
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{entry.name}</span>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full border font-medium", cfg.color)}>{cfg.label}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{entry.personas}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />~{entry.tiempo} min</span>
                  </div>
                </div>
                <button onClick={() => removeEntry(entry.id)} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all">
                  <X className="h-3.5 w-3.5 text-destructive" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {entries.length === 0 && (
        <div className="text-center py-8 text-sm text-muted-foreground">
          <UserPlus className="h-8 w-8 mx-auto mb-2 text-muted-foreground/20" />
          No hay grupos en espera
        </div>
      )}
    </div>
  );
};
