import { Skeleton } from "@/components/ui/skeleton";

export const NotificationSkeleton = () => (
  <div className="space-y-1">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="flex items-start gap-3 px-3 py-2.5 rounded-lg">
        <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
        <div className="flex-1 min-w-0 space-y-1.5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
      </div>
    ))}
  </div>
);
