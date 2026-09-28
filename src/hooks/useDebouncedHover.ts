"use client";

import { useCallback, useRef, useState } from "react";

export function useDebouncedHover(delayMs = 150): {
  active: boolean;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
} {
  const [active, setActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const onPointerEnter = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => setActive(true), delayMs);
  }, [clearTimer, delayMs]);

  const onPointerLeave = useCallback(() => {
    clearTimer();
    setActive(false);
  }, [clearTimer]);

  return { active, onPointerEnter, onPointerLeave };
}
