"use client";

import { useCallback, useRef } from "react";

const TAP_SLOP_PX = 14;

type FeedTouchLayerProps = {
  /** Tras el CTA de sonido: tap corto expone el iframe al gesto nativo del reproductor. */
  soundGateOpen: boolean;
  onExposeIframe: () => void;
};

/**
 * Escudo pasivo: no intercepta el scroll (sin preventDefault ni scrollTop manual).
 * `touch-action: pan-y` deja el desplazamiento al contenedor con snap nativo.
 */
export function FeedTouchLayer({
  soundGateOpen,
  onExposeIframe,
}: FeedTouchLayerProps) {
  const startY = useRef(0);
  const startX = useRef(0);
  const moved = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    startY.current = t.clientY;
    startX.current = t.clientX;
    moved.current = false;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    const dy = Math.abs(t.clientY - startY.current);
    const dx = Math.abs(t.clientX - startX.current);
    if (dy > TAP_SLOP_PX || dx > TAP_SLOP_PX) {
      moved.current = true;
    }
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (moved.current) {
        moved.current = false;
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
      className="pointer-events-auto absolute inset-0 z-[25] touch-pan-y bg-transparent"
      style={{ touchAction: "pan-y" }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      aria-hidden
    />
  );
}
