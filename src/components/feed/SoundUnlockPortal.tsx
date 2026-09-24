"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type SoundUnlockPortalProps = {
  visible: boolean;
  onUnlock: () => void;
};

/**
 * Botón flotante sin capa a pantalla completa (evita “ghost layer” en iOS/WebKit).
 * z-index por debajo de BottomNav (9999).
 */
export function SoundUnlockPortal({ visible, onUnlock }: SoundUnlockPortalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !visible) return null;

  return createPortal(
    <button
      type="button"
      onPointerUp={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onUnlock();
      }}
      className="pointer-events-auto fixed left-1/2 top-[42%] z-[500] -translate-x-1/2 cursor-pointer touch-manipulation transition-transform active:scale-95"
      style={{ touchAction: "manipulation" }}
      aria-label="Activar sonido"
    >
      <div className="flex items-center gap-2.5 rounded-2xl border border-pink-500/40 bg-black/85 px-5 py-2.5 text-xs font-bold text-white shadow-2xl shadow-pink-900/40 backdrop-blur-md">
        <span className="text-base text-pink-400">🔊</span>
        <span>Toca para activar sonido</span>
      </div>
    </button>,
    document.body,
  );
}
