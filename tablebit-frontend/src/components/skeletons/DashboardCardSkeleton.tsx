import { Skeleton } from "@/components/ui/skeleton";

export const DashboardCardSkeleton = () => (
  <div className="rounded-xl border border-border/50 bg-card p-5">
    <div className="flex items-start justify-between mb-3">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-9 w-9 rounded-lg" />
    </div>
    <Skeleton className="h-8 w-24" />
    <Skeleton className="h-3 w-32 mt-1" />
  </div>
);
