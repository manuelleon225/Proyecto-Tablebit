import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Check, Building2, MapPin, Phone, UtensilsCrossed, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { handleApiError } from "@/services/api";
import { restauranteService } from "@/services/restauranteService";
import { useSEO } from "@/hooks/useSEO";

const steps = [
  { title: "Restaurante", desc: "Nombre y tipo de comida" },
  { title: "Ubicación", desc: "Dirección y contacto" },
  { title: "Detalles", desc: "Descripción y capacidad" },
  { title: "Listo", desc: "Tu restaurante está creado" },
];

const OnboardingRestaurante = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [createdId, setCreatedId] = useState<number | null>(null);

  useSEO({ title: "TableBit - Configurar restaurante", description: "Crea tu restaurante en TableBit." });

  const [form, setForm] = useState({
    nombre: "", tipo_comida: "", direccion: "", telefono: "", descripcion: "", ciudad: "", capacidad_total: 50,
  });

  const update = (field: string, value: string | number) => setForm((prev) => ({ ...prev, [field]: value }));

  const canProceed = () => {
    if (step === 0) return form.nombre.trim().length > 0 && form.tipo_comida.trim().length > 0;
    if (step === 1) return form.direccion.trim().length > 0 && form.ciudad.trim().length > 0;
    if (step === 2) return form.descripcion.trim().length > 0;
    return true;
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await restauranteService.crear({
        nombre: form.nombre, direccion: form.direccion, telefono: form.telefono,
        ciudad: form.ciudad, tipo_comida: form.tipo_comida, capacidad_total: form.capacidad_total,
      });
      setCreatedId(res.data.restaurante?.id || res.data.id);
      setStep(3);
      toast({ title: "Restaurante creado", description: "Ahora puedes configurar mesas y horarios." });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: handleApiError(err).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/50">
      <header className="sticky top-0 z-50 border-b border-border/30 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-14 sm:h-16 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
              <UtensilsCrossed className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg sm:text-xl font-bold tracking-tight">TableBit</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-8 justify-center">
            {steps.map((s, i) => (
              <div key={s.title} className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  i < step ? "bg-primary text-primary-foreground" : i === step ? "bg-primary/10 text-primary border-2 border-primary" : "bg-muted text-muted-foreground"
                }`}>
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                {i < steps.length - 1 && <div className={`h-0.5 w-8 sm:w-12 ${i < step ? "bg-primary" : "bg-muted"}`} />}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              {step === 0 && (
                <div className="space-y-5">
                  <div className="text-center mb-2">
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 border border-primary/10 px-3 py-1 text-xs font-medium text-primary mb-3"><Building2 className="h-3 w-3" /> {steps[0].title}</div>
                    <h2 className="font-display text-2xl font-bold">¿Cómo se llama tu restaurante?</h2>
                    <p className="text-sm text-muted-foreground mt-1">{steps[0].desc}</p>
                  </div>
                  <div className="space-y-2"><Label>Nombre del restaurante</Label><Input value={form.nombre} onChange={(e) => update("nombre", e.target.value)} placeholder="Ej: Sushi Bar Ikigai" className="h-11 bg-card/50" /></div>
                  <div className="space-y-2"><Label>Tipo de comida</Label><Input value={form.tipo_comida} onChange={(e) => update("tipo_comida", e.target.value)} placeholder="Ej: Japonesa, Italiana, Mexicana" className="h-11 bg-card/50" /></div>
                </div>
              )}
              {step === 1 && (
                <div className="space-y-5">
                  <div className="text-center mb-2">
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 border border-primary/10 px-3 py-1 text-xs font-medium text-primary mb-3"><MapPin className="h-3 w-3" /> {steps[1].title}</div>
                    <h2 className="font-display text-2xl font-bold">¿Dónde está ubicado?</h2>
                    <p className="text-sm text-muted-foreground mt-1">{steps[1].desc}</p>
                  </div>
                  <div className="space-y-2"><Label>Dirección</Label><Input value={form.direccion} onChange={(e) => update("direccion", e.target.value)} placeholder="Calle 123 #45-67" className="h-11 bg-card/50" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Ciudad</Label><Input value={form.ciudad} onChange={(e) => update("ciudad", e.target.value)} placeholder="Bogotá" className="h-11 bg-card/50" /></div>
                    <div className="space-y-2"><Label>Teléfono</Label><Input value={form.telefono} onChange={(e) => update("telefono", e.target.value)} placeholder="3001234567" className="h-11 bg-card/50" /></div>
                  </div>
                </div>
              )}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="text-center mb-2">
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/5 border border-primary/10 px-3 py-1 text-xs font-medium text-primary mb-3"><Sparkles className="h-3 w-3" /> {steps[2].title}</div>
                    <h2 className="font-display text-2xl font-bold">Cuéntanos más</h2>
                    <p className="text-sm text-muted-foreground mt-1">{steps[2].desc}</p>
                  </div>
                  <div className="space-y-2"><Label>Descripción</Label><textarea value={form.descripcion} onChange={(e) => update("descripcion", e.target.value)} placeholder="Describe tu restaurante..." className="w-full h-24 px-3 py-2 rounded-lg bg-card/50 border border-border/50 text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all resize-none" /></div>
                  <div className="space-y-2"><Label>Capacidad total</Label><Input type="number" value={form.capacidad_total} onChange={(e) => update("capacidad_total", Number(e.target.value))} min={1} className="h-11 bg-card/50" /></div>
                </div>
              )}
              {step === 3 && (
                <div className="text-center py-8">
                  <div className="h-16 w-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4"><Check className="h-8 w-8 text-success" /></div>
                  <h2 className="font-display text-2xl font-bold">¡Restaurante creado!</h2>
                  <p className="text-sm text-muted-foreground mt-2 mb-8 max-w-sm mx-auto">Tu restaurante {form.nombre} está listo. Ahora puedes configurar mesas y horarios.</p>
                  <div className="flex flex-col gap-3 max-w-xs mx-auto">
                    <Button onClick={() => navigate("/dashboard/mesas")}>Configurar mesas</Button>
                    <Button variant="outline" onClick={() => navigate("/dashboard")}>Ir al dashboard</Button>
                  </div>
                </div>
              )}

              {step < 3 && (
                <div className="flex gap-3 pt-4">
                  {step > 0 && <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1"><ArrowLeft className="h-4 w-4 mr-2" /> Atrás</Button>}
                  <Button onClick={step === 2 ? handleCreate : () => setStep(step + 1)} disabled={!canProceed() || loading} className="flex-1">
                    {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creando...</> : step === 2 ? "Crear restaurante" : "Continuar"}
                    {step < 2 && <ArrowRight className="h-4 w-4 ml-2" />}
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default OnboardingRestaurante;
