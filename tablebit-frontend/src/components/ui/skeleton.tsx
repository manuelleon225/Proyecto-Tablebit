import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  animated?: boolean;
  variant?: "default" | "text" | "avatar" | "button" | "card" | "image";
}

const variantClasses: Record<string, string> = {
  default: "rounded-lg",
  text: "h-4 w-full rounded",
  avatar: "h-10 w-10 rounded-full",
  button: "h-9 w-24 rounded-lg",
  card: "rounded-xl",
  image: "aspect-video rounded-xl",
};

const Skeleton = ({ className, animated = true, variant = "default" }: SkeletonProps) => (
  <div
    className={cn(
      variantClasses[variant],
      "bg-muted/60 relative overflow-hidden",
      animated && "motion-safe:animate-pulse",
      className,
    )}
    aria-hidden="true"
  >
    {animated && (
      <div
        className="absolute inset-0 motion-safe:animate-shimmer"
        style={{
          background: "linear-gradient(90deg, transparent 0%, hsl(var(--muted)/0.3) 50%, transparent 100%)",
          backgroundSize: "200% 100%",
        }}
      />
    )}
  </div>
);

export { Skeleton };
