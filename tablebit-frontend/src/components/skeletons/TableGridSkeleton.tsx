import { Skeleton } from "@/components/ui/skeleton";

export const TableGridSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="aspect-square rounded-xl border border-border bg-card p-5">
        <Skeleton className="h-5 w-20 mb-3" />
        <Skeleton className="h-4 w-16 mb-3" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    ))}
  </div>
);
