import { useState, useRef, useCallback, useMemo, useEffect } from "react";

interface UseVirtualListOptions<T> {
  items: T[];
  itemHeight: number;
  overscan?: number;
  gap?: number;
}

export function useVirtualList<T>({ items, itemHeight, overscan = 5, gap = 0 }: UseVirtualListOptions<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  const totalHeight = items.length * itemHeight + Math.max(0, items.length - 1) * gap;

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerHeight(entry.contentRect.height);
    });
    ro.observe(el);
    setContainerHeight(el.clientHeight);
    return () => ro.disconnect();
  }, []);

  const visibleRange = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / (itemHeight + gap)) - overscan);
    const visibleCount = Math.ceil(containerHeight / (itemHeight + gap)) + overscan * 2;
    const end = Math.min(items.length, start + visibleCount);
    return { start, end };
  }, [scrollTop, containerHeight, itemHeight, gap, overscan, items.length]);

  const visibleItems = useMemo(() => items.slice(visibleRange.start, visibleRange.end), [items, visibleRange.start, visibleRange.end]);

  const spacerStyle: React.CSSProperties = useMemo(() => ({
    height: visibleRange.start * (itemHeight + gap),
    flexShrink: 0,
  }), [visibleRange.start, itemHeight, gap]);

  const bottomSpacerStyle: React.CSSProperties = useMemo(() => ({
    height: Math.max(0, items.length - visibleRange.end) * (itemHeight + gap),
    flexShrink: 0,
  }), [items.length, visibleRange.end, itemHeight, gap]);

  return {
    containerRef,
    visibleItems,
    spacerStyle,
    bottomSpacerStyle,
    totalHeight,
    handleScroll,
    onScroll: handleScroll,
  };
}
