"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type SessionAudioOverlayProps = {
  visible: boolean;
  onUnlock: () => void;
};

export function SessionAudioOverlay({
  visible,
  onUnlock,
}: SessionAudioOverlayProps) {
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
      className="pointer-events-auto fixed left-1/2 top-[40%] z-[8000] max-w-[90vw] -translate-x-1/2 touch-manipulation active:scale-[0.98]"
      style={{ touchAction: "manipulation" }}
      aria-label="Tap screen for sound"
    >
      <div className="rounded-2xl border border-pink-500/40 bg-black/90 px-6 py-3 text-center text-sm font-bold text-white shadow-2xl shadow-pink-900/50 backdrop-blur-md">
        <span className="mb-1 block text-lg">🔇</span>
        Tap screen for sound
      </div>
    </button>,
    document.body,
  );
}
