import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MessageSquare, User, ThumbsUp, Clock } from "lucide-react";
import api from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const timeAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  return `hace ${Math.floor(hrs / 24)}d`;
};

const StarRating = ({ value, onChange, size = "sm" }: { value: number; onChange?: (v: number) => void; size?: string }) => {
  const sz = size === "sm" ? "h-4 w-4" : "h-6 w-6";
  return (
    <div className="flex gap-0.5" role="radiogroup" aria-label="Calificación">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button"
          onClick={() => onChange?.(star)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onChange?.(star); } }}
          className={`${sz} ${star <= value ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"} ${onChange ? "cursor-pointer hover:scale-125 transition-transform" : "cursor-default"}`}
          aria-label={`${star} estrella${star !== 1 ? "s" : ""}`}
          role="radio"
          aria-checked={star <= value}
          tabIndex={onChange ? 0 : -1}
        >
          <Star className={`${sz} ${star <= value ? "fill-yellow-400" : ""}`} />
        </button>
      ))}
    </div>
  );
};

const ReviewCard = ({ review }: { review: any }) => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
    className="p-4 rounded-xl border border-border/50 bg-card shadow-card">
    <div className="flex items-start gap-3">
      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0" aria-hidden="true">
        <span className="text-xs font-semibold text-primary">{review.usuario?.name?.[0] || "?"}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">{review.usuario?.name || "Usuario"}</span>
          <StarRating value={review.rating} />
          <span className="text-xs text-muted-foreground ml-auto">{timeAgo(review.created_at)}</span>
        </div>
        {review.comentario && <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{review.comentario}</p>}
      </div>
    </div>
  </motion.div>
);

const CreateReviewForm = ({ restauranteId, onCreated }: { restauranteId: number; onCreated: () => void }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comentario, setComentario] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/restaurantes/${restauranteId}/reviews`, { rating, comentario });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', restauranteId] });
      toast.success("Reseña publicada");
      setRating(0);
      setComentario("");
      onCreated();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Error al publicar reseña");
    },
  });

  if (!user) return null;

  return (
    <div className="p-5 rounded-xl border border-border/50 bg-card shadow-card">
      <h4 className="font-display text-sm font-semibold mb-3">Escribe tu reseña</h4>
      <div className="mb-3">
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>
      <textarea value={comentario} onChange={(e) => setComentario(e.target.value)}
        placeholder="Cuenta tu experiencia (opcional)"
        className="w-full h-20 px-3 py-2 rounded-lg bg-muted/50 border border-border/50 text-sm resize-none focus:outline-none focus:border-primary/50 transition-colors mb-3"
        aria-label="Tu comentario" />
      <Button size="sm" onClick={() => mutation.mutate()} disabled={rating === 0 || mutation.isPending} className="w-full">
        {mutation.isPending ? "Publicando..." : "Publicar reseña"}
      </Button>
    </div>
  );
};

const RatingDistribution = ({ reviews, total }: { reviews: any[]; total: number }) => {
  const dist = [5, 4, 3, 2, 1].map((s) => ({
    star: s,
    count: reviews.filter((r) => r.rating === s).length,
    pct: total > 0 ? (reviews.filter((r) => r.rating === s).length / total) * 100 : 0,
  }));

  return (
    <div className="space-y-1.5">
      {dist.map((d) => (
        <div key={d.star} className="flex items-center gap-2 text-xs">
          <span className="w-3 text-muted-foreground">{d.star}</span>
          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${d.pct}%` }}
              className="h-full bg-yellow-400 rounded-full transition-all" />
          </div>
          <span className="w-8 text-right text-muted-foreground">{d.count}</span>
        </div>
      ))}
    </div>
  );
};

export const ReviewsSection = ({ restauranteId }: { restauranteId: number }) => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', restauranteId],
    queryFn: async () => {
      const res = await api.get(`/restaurantes/${restauranteId}/reviews`);
      return res.data;
    },
  });

  const reviews = data?.reviews || [];
  const promedio = data?.promedio || 0;
  const total = data?.total || 0;

  return (
    <section aria-label="Reseñas del restaurante">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" /> Reseñas
        </h2>
        {user && !showForm && total === 0 && (
          <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
            Escribir reseña
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : total > 0 ? (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 p-5 rounded-xl border border-border/50 bg-card shadow-card text-center">
            <p className="font-display text-4xl font-bold">{promedio}</p>
            <div className="flex justify-center mt-1 mb-1"><StarRating value={Math.round(promedio)} /></div>
            <p className="text-xs text-muted-foreground">{total} reseña{total !== 1 ? "s" : ""}</p>
            <div className="mt-4"><RatingDistribution reviews={reviews} total={total} /></div>
          </div>
          <div className="md:col-span-2 space-y-3">
            <AnimatePresence>
              {reviews.map((r: any) => <ReviewCard key={r.id} review={r} />)}
            </AnimatePresence>
            {!showForm && user && (
              <Button variant="outline" size="sm" onClick={() => setShowForm(true)} className="w-full mt-2">
                Escribir reseña
              </Button>
            )}
            {showForm && <CreateReviewForm restauranteId={restauranteId} onCreated={() => setShowForm(false)} />}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 rounded-xl border border-dashed border-border/30 bg-card/30">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground/20" />
          <p className="text-sm text-muted-foreground font-medium">No hay reseñas aún</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Sé el primero en opinar</p>
          {user && (
            <Button variant="outline" size="sm" onClick={() => setShowForm(true)} className="mt-4">
              Escribir reseña
            </Button>
          )}
        </div>
      )}
    </section>
  );
};
