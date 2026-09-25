"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { IconVolumeOff } from "@/components/icons/LineIcons";

type SessionAudioOverlayProps = {
  visible: boolean;
};

/**
 * Non-blocking hint only — taps must reach the cross-origin player iframe.
 */
export function SessionAudioOverlay({ visible }: SessionAudioOverlayProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !visible) return null;

  return createPortal(
    <div
      className="pointer-events-none fixed inset-0 z-[8000] flex items-start justify-center pt-[38%]"
      aria-live="polite"
    >
      <div className="max-w-[90vw] rounded-2xl border border-pink-500/40 bg-black/85 px-6 py-3 text-center text-sm font-bold text-white shadow-2xl shadow-pink-900/50 backdrop-blur-md">
        <span className="mb-2 flex justify-center text-white">
          <IconVolumeOff size={28} strokeWidth={1.65} />
        </span>
        Tap the live video to enable sound
      </div>
    </div>,
    document.body,
  );
}
