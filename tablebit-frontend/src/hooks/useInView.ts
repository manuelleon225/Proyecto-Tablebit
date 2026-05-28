import { useRef, useState, useEffect, useCallback } from "react";

interface UseInViewOptions {
  rootMargin?: string;
  threshold?: number;
  triggerOnce?: boolean;
}

export function useInView<T extends HTMLElement = HTMLDivElement>({
  rootMargin = "100px",
  threshold = 0,
  triggerOnce = true,
}: UseInViewOptions = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (triggerOnce && inView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (triggerOnce) observer.unobserve(el);
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [rootMargin, threshold, triggerOnce, inView]);

  return { ref, inView };
}
