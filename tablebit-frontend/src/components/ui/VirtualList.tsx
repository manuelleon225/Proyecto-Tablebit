import { memo } from "react";
import { useVirtualList } from "@/hooks/useVirtualList";
import { cn } from "@/lib/utils";

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  gap?: number;
  className?: string;
  style?: React.CSSProperties;
}

function VirtualListInner<T>({ items, itemHeight, renderItem, overscan = 5, gap = 0, className, style }: VirtualListProps<T>) {
  const { containerRef, visibleItems, spacerStyle, bottomSpacerStyle, onScroll } = useVirtualList({
    items,
    itemHeight,
    overscan,
    gap,
  });

  return (
    <div
      ref={containerRef}
      onScroll={onScroll}
      className={cn("overflow-y-auto", className)}
      style={{ ...style, WebkitOverflowScrolling: "touch" as any }}
    >
      <div style={spacerStyle} />
      {visibleItems.map((item, i) => renderItem(item, i))}
      <div style={bottomSpacerStyle} />
    </div>
  );
}

const VirtualList = memo(VirtualListInner) as <T>(props: VirtualListProps<T>) => JSX.Element;

export { VirtualList };
