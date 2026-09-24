"use client";

import { useCallback, useRef } from "react";

const TAP_SLOP_PX = 14;

type FeedTouchLayerProps = {
  /** Contenedor con overflow-y que debe hacer scroll (feed TikTok). */
  scrollRootRef: React.RefObject<HTMLElement | null>;
  /** Tras desbloquear el gate de sonido, un tap expone el iframe unos segundos. */
  soundGateOpen: boolean;
  onExposeIframe: () => void;
};

/**
 * Capa transparente sobre el iframe: captura pan-y para el scroll del padre
 * e impide que el iframe se quede con los touchmove.
 */
export function FeedTouchLayer({
  scrollRootRef,
  soundGateOpen,
  onExposeIframe,
}: FeedTouchLayerProps) {
  const startY = useRef(0);
  const startX = useRef(0);
  const lastY = useRef(0);
  const dragging = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    startY.current = t.clientY;
    startX.current = t.clientX;
    lastY.current = t.clientY;
    dragging.current = false;
  }, []);

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;

      const dyTotal = t.clientY - startY.current;
      const dxTotal = t.clientX - startX.current;
      if (
        !dragging.current &&
        (Math.abs(dyTotal) > TAP_SLOP_PX || Math.abs(dxTotal) > TAP_SLOP_PX)
      ) {
        dragging.current = true;
      }

      if (!dragging.current) return;

      const root = scrollRootRef.current;
      if (!root) return;

      const step = lastY.current - t.clientY;
      lastY.current = t.clientY;
      root.scrollTop += step;
      e.preventDefault();
    },
    [scrollRootRef],
  );

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (dragging.current) {
        dragging.current = false;
        return;
      }

      if (!soundGateOpen) return;

      const t = e.changedTouches[0];
      if (!t) return;
      const dy = Math.abs(t.clientY - startY.current);
      const dx = Math.abs(t.clientX - startX.current);
      if (dy <= TAP_SLOP_PX && dx <= TAP_SLOP_PX) {
        onExposeIframe();
      }
    },
    [soundGateOpen, onExposeIframe],
  );

  return (
    <div
      className="pointer-events-auto absolute inset-0 z-[25] bg-transparent touch-pan-y"
      style={{ touchAction: "pan-y" }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      aria-hidden
    />
  );
}
