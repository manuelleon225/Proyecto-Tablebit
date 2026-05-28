import { Skeleton } from "@/components/ui/skeleton";

export const CalendarDaySkeleton = () => (
  <div className="rounded-xl border border-border bg-card">
    <div className="grid grid-cols-7 border-b border-border">
      {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
        <div key={d} className="p-2 sm:p-3 text-center">
          <Skeleton className="h-4 w-8 mx-auto" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-7">
      {Array.from({ length: 35 }).map((_, i) => (
        <div key={i} className="aspect-square p-1 sm:p-2 border-b border-r border-border">
          <Skeleton className="h-6 w-6 rounded-full mb-1" />
          <div className="space-y-0.5">
            <Skeleton className="h-2 w-full rounded" />
            <Skeleton className="h-2 w-3/4 rounded" />
          </div>
        </div>
      ))}
    </div>
  </div>
);
