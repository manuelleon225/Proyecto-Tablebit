import { type ReactNode } from "react";
import { useInView } from "@/hooks/useInView";

interface LazyViewportProps {
  children: ReactNode;
  placeholder?: ReactNode;
  rootMargin?: string;
  className?: string;
}

const LazyViewport = ({ children, placeholder, rootMargin = "100px", className }: LazyViewportProps) => {
  const { ref, inView } = useInView({ rootMargin, triggerOnce: true });

  return (
    <div ref={ref} className={className}>
      {inView ? children : placeholder}
    </div>
  );
};

export default LazyViewport;
