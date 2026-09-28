"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

type UseInViewOptions = {
  rootMargin?: string;
  threshold?: number;
};

export function useInView<T extends HTMLElement>(
  options: UseInViewOptions = {},
): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setInView(entries.some((entry) => entry.isIntersecting));
      },
      {
        root: null,
        rootMargin: options.rootMargin ?? "240px 0px",
        threshold: options.threshold ?? 0.01,
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [options.rootMargin, options.threshold]);

  return [ref, inView];
}
