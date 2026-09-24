import { useMemo } from "react";

const DEFAULT_RADIUS = 2;

/** Índices con iframe montado (ventana N±radius). */
export function useVideoFeedBuffer(
  activeIndex: number,
  total: number,
  radius = DEFAULT_RADIUS,
): { armedIndices: Set<number>; isArmed: (index: number) => boolean } {
  const armedIndices = useMemo(() => {
    const set = new Set<number>();
    if (total <= 0) return set;
    const lo = Math.max(0, activeIndex - radius);
    const hi = Math.min(total - 1, activeIndex + radius);
    for (let i = lo; i <= hi; i += 1) {
      set.add(i);
    }
    return set;
  }, [activeIndex, total, radius]);

  const isArmed = (index: number) => armedIndices.has(index);

  return { armedIndices, isArmed };
}
