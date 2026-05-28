import { Skeleton } from "@/components/ui/skeleton";

export const ReservationTableSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-9 w-full max-w-xs rounded-lg" />
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-card">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-border/20 last:border-0">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 flex items-center gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  </div>
);
