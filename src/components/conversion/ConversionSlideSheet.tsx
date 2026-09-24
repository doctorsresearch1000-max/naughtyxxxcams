"use client";

import { useEffect } from "react";

type ConversionSlideSheetProps = {
  open: boolean;
  modelName: string;
  affiliateUrl: string;
  onClose: () => void;
};

export function ConversionSlideSheet({
  open,
  modelName,
  affiliateUrl,
  onClose,
}: ConversionSlideSheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <button
        type="button"
        aria-label="Dismiss"
        className={`fixed inset-0 z-[100000] bg-black/30 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="conversion-sheet-title"
        aria-hidden={!open}
        className={`fixed bottom-0 left-0 right-0 z-[100001] mx-auto w-full max-w-md transform transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full pointer-events-none"
        }`}
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-3 mb-3 rounded-3xl border border-white/10 bg-[#1C1C1E]/98 p-5 shadow-[0_-8px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-zinc-600" />
          <h2
            id="conversion-sheet-title"
            className="text-center text-base font-black text-white"
          >
            Private chat
          </h2>
          <p className="mt-2 text-center text-sm leading-relaxed text-zinc-400">
            Want to chat privately? Click the CTA below to start talking with
            her right now.
          </p>
          <a
            href={affiliateUrl}
            target="_blank"
            rel="nofollow noopener"
            className="mt-4 flex w-full items-center justify-center rounded-full bg-[#39FF14] px-4 py-3.5 text-sm font-extrabold text-black shadow-[0_0_24px_rgba(57,255,20,0.35)] transition active:scale-[0.98]"
          >
            Chat with {modelName}
          </a>
          <button
            type="button"
            onClick={onClose}
            className="mt-2 w-full rounded-full py-2 text-xs font-semibold text-zinc-500 transition hover:text-zinc-300"
          >
            Maybe later
          </button>
        </div>
      </div>
    </>
  );
}
