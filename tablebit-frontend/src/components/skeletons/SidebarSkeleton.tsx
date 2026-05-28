import { Skeleton } from "@/components/ui/skeleton";

export const SidebarSkeleton = () => (
  <div className="flex flex-col h-full">
    <div className="p-5">
      <div className="flex items-center gap-2.5">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-5 w-24" />
      </div>
    </div>
    <nav className="flex-1 px-3 space-y-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </nav>
  </div>
);
