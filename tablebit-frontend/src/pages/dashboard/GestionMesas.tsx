import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { restauranteService, type Mesa } from "@/services/restauranteService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, AlertCircle, Loader2, UtensilsCrossed, Edit2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { handleApiError } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { useSEO } from "@/hooks/useSEO";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const estadoConfig: Record<string, { label: string; color: string; bg: string }> = {
  disponible: { label: "Disponible", color: "text-success", bg: "bg-success/10 border-success/20" },
  ocupada: { label: "Ocupada", color: "text-destructive", bg: "bg-destructive/10 border-destructive/20" },
  inactiva: { label: "Inactiva", color: "text-muted-foreground", bg: "bg-muted/50 border-border" },
  mantenimiento: { label: "Mantenimiento", color: "text-warning", bg: "bg-warning/10 border-warning/20" },
};

const GestionMesas = () => {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filterEstado, setFilterEstado] = useState<string>("todas");
  const [newNumero, setNewNumero] = useState("");
  const [newCapacidad, setNewCapacidad] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingMesa, setEditingMesa] = useState<Mesa | null>(null);
  const [editNumero, setEditNumero] = useState("");
  const [editCapacidad, setEditCapacidad] = useState("");
  const [editEstado, setEditEstado] = useState("");

  useSEO({
    title: "TableBit - Gestión de mesas",
    description: "Administra las mesas de tus restaurantes en TableBit.",
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchMesas = useCallback(async () => {
    if (!user?.restaurante) {
      setLoading(false);
      setError("No tienes un restaurante asociado. Cierra sesión y vuelve a ingresar.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await restauranteService.getMesasRestaurante(user.restaurante.id);
      setMesas(res.data);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMesas();
  }, [fetchMesas]);

  const addMesa = async () => {
    if (!newNumero || !newCapacidad) {
      toast({ variant: "destructive", title: "Error", description: "Completa todos los campos" });
      return;
    }
    if (!user?.restaurante) return;

    setCreating(true);
    try {
      await restauranteService.crearMesa({
        restaurante_id: user.restaurante.id,
        numero: Number(newNumero),
        capacidad: Number(newCapacidad),
      });
      toast({ title: "Mesa creada", description: `Mesa #${newNumero} agregada exitosamente` });
      setNewNumero("");
      setNewCapacidad("");
      setShowForm(false);
      fetchMesas();
    } catch (err) {
      const apiError = handleApiError(err);
      toast({ variant: "destructive", title: "Error", description: apiError.message });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeletingId(id);
    setShowDeleteDialog(true);
  };

  const removeMesa = async () => {
    if (!deletingId) return;
    setShowDeleteDialog(false);
    try {
      await restauranteService.eliminarMesa(deletingId);
      toast({ title: "Mesa desactivada", description: "La mesa ha sido marcada como inactiva" });
      fetchMesas();
    } catch (err) {
      const apiError = handleApiError(err);
      toast({ variant: "destructive", title: "Error", description: apiError.message });
    } finally {
      setDeletingId(null);
    }
  };

  const openEdit = (mesa: Mesa) => {
    setEditingMesa(mesa);
    setEditNumero(String(mesa.numero));
    setEditCapacidad(String(mesa.capacidad));
    setEditEstado(mesa.estado);
    setShowEditDialog(true);
  };

  const saveEdit = async () => {
    if (!editingMesa) return;
    setSavingEdit(true);
    try {
      await restauranteService.actualizarMesa(editingMesa.id, {
        numero: Number(editNumero),
        capacidad: Number(editCapacidad),
        estado: editEstado as Mesa["estado"],
      });
      toast({ title: "Mesa actualizada", description: `Mesa #${editNumero} actualizada correctamente` });
      setShowEditDialog(false);
      setEditingMesa(null);
      fetchMesas();
    } catch (err) {
      const apiError = handleApiError(err);
      toast({ variant: "destructive", title: "Error", description: apiError.message });
    } finally {
      setSavingEdit(false);
    }
  };

  const filteredMesas = filterEstado === "todas"
    ? mesas
    : mesas.filter((m) => m.estado === filterEstado);

  const counts = mesas.reduce((acc, m) => {
    acc[m.estado] = (acc[m.estado] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <DashboardLayout>
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold">Gestión de Mesas</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {mesas.length} mesa{mesas.length !== 1 ? "s" : ""} registrada{mesas.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-1.5" /> Agregar mesa
          </Button>
        </div>

        {/* Filters */}
        {!loading && mesas.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-1 px-1 scrollbar-hide">
            {[
              { key: "todas", label: "Todas", count: mesas.length },
              ...Object.entries(estadoConfig).map(([key, cfg]) => ({
                key,
                label: cfg.label,
                count: counts[key] || 0,
              })),
            ]
              .filter((tab) => tab.count > 0 || tab.key === "todas")
              .map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilterEstado(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                    filterEstado === tab.key
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted border border-border"
                  }`}
                >
                  {tab.label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${filterEstado === tab.key ? "bg-primary-foreground/20" : "bg-muted"}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-5 animate-pulse">
                <div className="h-5 w-20 bg-muted rounded mb-3" />
                <div className="h-4 w-16 bg-muted rounded mb-3" />
                <div className="h-6 w-20 bg-muted rounded-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 rounded-xl border border-border bg-card">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive/50" />
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" onClick={fetchMesas}>Reintentar</Button>
          </div>
        ) : (
          <>
            {showForm && (
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm mb-6 animate-fade-in">
                <h3 className="font-display text-md font-semibold mb-4">Nueva mesa</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Número de mesa</Label>
                    <Input type="number" value={newNumero} onChange={(e) => setNewNumero(e.target.value)} placeholder="Ej: 6" min={1} />
                  </div>
                  <div className="space-y-2">
                    <Label>Capacidad</Label>
                    <Input type="number" value={newCapacidad} onChange={(e) => setNewCapacidad(e.target.value)} placeholder="Ej: 4" min={1} />
                  </div>
                  <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-2">
                    <Button onClick={addMesa} className="flex-1" disabled={creating}>
                      {creating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creando...</> : "Agregar"}
                    </Button>
                    <Button variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
                  </div>
                </div>
              </div>
            )}

            {filteredMesas.length === 0 ? (
              <div className="text-center py-16 rounded-xl border border-border bg-card">
                <UtensilsCrossed className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground">No hay mesas{filterEstado !== "todas" ? " en este estado" : ""}.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredMesas.map((mesa) => {
                  const cfg = estadoConfig[mesa.estado];
                  return (
                    <div key={mesa.id} className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-all animate-fade-in">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-display text-lg font-semibold">Mesa {mesa.numero}</h3>
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(mesa)} className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          {mesa.estado !== "inactiva" && (
                            <button onClick={() => handleDeleteClick(mesa.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{mesa.capacidad} personas</p>
                      <Badge className={`${cfg?.bg} ${cfg?.color}`}>
                        {cfg?.label || mesa.estado}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desactivar mesa?</AlertDialogTitle>
            <AlertDialogDescription>
              La mesa será marcada como inactiva. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction onClick={removeMesa} className="bg-destructive text-destructive-foreground">
              Sí, desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Mesa #{editingMesa?.numero}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Número</Label>
              <Input type="number" value={editNumero} onChange={(e) => setEditNumero(e.target.value)} min={1} />
            </div>
            <div className="space-y-2">
              <Label>Capacidad</Label>
              <Input type="number" value={editCapacidad} onChange={(e) => setEditCapacidad(e.target.value)} min={1} />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(estadoConfig).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => setEditEstado(key)}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                      editEstado === key
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={saveEdit} className="flex-1" disabled={savingEdit}>
                {savingEdit ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Guardando...</> : <><Save className="h-4 w-4 mr-1.5" />Guardar</>}
              </Button>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                <X className="h-4 w-4 mr-1.5" />Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default GestionMesas;
