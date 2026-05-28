import { Skeleton } from "@/components/ui/skeleton";

export const ChartSkeleton = () => (
  <div className="rounded-xl border border-border/50 bg-card p-5 shadow-card">
    <Skeleton className="h-5 w-40 rounded mb-4" />
    <Skeleton className="h-56 rounded-lg" />
  </div>
);
