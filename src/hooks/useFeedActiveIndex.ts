import { useCallback, useEffect, useState } from "react";

export function useFeedActiveIndex(
  scrollRef: React.RefObject<HTMLElement | null>,
  slideCount: number,
) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  const readIndex = useCallback(() => {
    const root = scrollRef.current;
    if (!root) return;
    const h = root.clientHeight;
    if (h <= 0) return;
    const idx = Math.round(root.scrollTop / h);
    setActiveIndex(Math.min(Math.max(idx, 0), Math.max(slideCount - 1, 0)));
  }, [scrollRef, slideCount]);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;

    let scrollEndTimer: ReturnType<typeof setTimeout> | null = null;

    const onScroll = () => {
      setIsScrolling(true);
      readIndex();
      if (scrollEndTimer) clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(() => {
        setIsScrolling(false);
        readIndex();
      }, 120);
    };

    root.addEventListener("scroll", onScroll, { passive: true });
    readIndex();

    return () => {
      root.removeEventListener("scroll", onScroll);
      if (scrollEndTimer) clearTimeout(scrollEndTimer);
    };
  }, [scrollRef, readIndex, slideCount]);

  return { activeIndex, isScrolling };
}
