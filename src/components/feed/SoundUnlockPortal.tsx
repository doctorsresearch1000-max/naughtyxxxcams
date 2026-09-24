"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type SoundUnlockPortalProps = {
  visible: boolean;
  onUnlock: () => void;
};

/**
 * No recarga el iframe ni cambia muted: solo quita el CTA para que el usuario
 * toque el reproductor con gesto nativo (políticas iOS/Android).
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
      className="pointer-events-auto fixed left-1/2 top-[38%] z-[500] max-w-[90vw] -translate-x-1/2 cursor-pointer touch-manipulation transition-transform active:scale-95"
      style={{ touchAction: "manipulation" }}
      aria-label="Preparar audio de la transmisión"
    >
      <div className="flex flex-col items-center gap-1 rounded-2xl border border-pink-500/40 bg-black/85 px-5 py-2.5 text-center text-xs font-bold text-white shadow-2xl shadow-pink-900/40 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <span className="text-base text-pink-400">🔊</span>
          <span>Continuar</span>
        </div>
        <span className="text-[10px] font-medium text-zinc-400">
          Después toca el vídeo para activar el sonido
        </span>
      </div>
    </button>,
    document.body,
  );
}
