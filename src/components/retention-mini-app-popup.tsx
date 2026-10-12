"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AGE_GATE_ACCEPTED_EVENT } from "@/lib/compliance/ageGateStorage";
import { buildMiniAppEntryUrl } from "@/lib/mini-app-entry";
import {
  RETENTION_POPUP_DELAY_MS,
  canShowRetentionPopup,
  markRetentionPopupDismissed,
  markRetentionPopupShown,
  shouldAccumulateRetentionTime,
  startRetentionActiveTimer,
} from "@/lib/retention-popup";

export function RetentionMiniAppPopup() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [appUrl, setAppUrl] = useState<string | null>(null);
  const [ageGateTick, setAgeGateTick] = useState(0);

  useEffect(() => {
    setAppUrl(buildMiniAppEntryUrl());
  }, []);

  useEffect(() => {
    const onAgeAccepted = () => setAgeGateTick((n) => n + 1);
    window.addEventListener(AGE_GATE_ACCEPTED_EVENT, onAgeAccepted);
    return () =>
      window.removeEventListener(AGE_GATE_ACCEPTED_EVENT, onAgeAccepted);
  }, []);

  const dismiss = useCallback(() => {
    markRetentionPopupDismissed();
    setOpen(false);
  }, []);

  const onTimerElapsed = useCallback(() => {
    if (!canShowRetentionPopup() || !buildMiniAppEntryUrl()) return;
    markRetentionPopupShown();
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!appUrl) return;

    const stop = startRetentionActiveTimer({
      delayMs: RETENTION_POPUP_DELAY_MS,
      shouldRun: () => shouldAccumulateRetentionTime(pathname),
      onElapsed: onTimerElapsed,
    });

    return stop;
  }, [appUrl, pathname, ageGateTick, onTimerElapsed]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !appUrl) return null;

  return (
    <div
      className="fixed inset-0 z-[160] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="retention-mini-app-title"
      onClick={dismiss}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e14] shadow-[0_24px_80px_rgba(0,0,0,0.65)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(236,72,153,0.22),transparent_55%)]"
          aria-hidden
        />

        <button
          type="button"
          onClick={dismiss}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/40 text-lg leading-none text-zinc-300 transition hover:border-pink-500/40 hover:text-white"
          aria-label="Close"
        >
          ×
        </button>

        <div className="relative px-6 pb-6 pt-8 text-center sm:px-8 sm:pb-8 sm:pt-10">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-[#0a0a0f] shadow-inner sm:h-16 sm:w-16">
            <Image
              src="/logo.png"
              alt="Naughty"
              width={48}
              height={48}
              className="h-10 w-10 object-contain sm:h-12 sm:w-12"
              priority
            />
          </div>

          <h2
            id="retention-mini-app-title"
            className="text-xl font-black tracking-tight text-white sm:text-2xl"
          >
            Unlock the Full Naughty Experience
          </h2>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-zinc-400 sm:text-[15px]">
            Open our official app for exclusive live model alerts, VIP access,
            and uninterrupted private chat.
          </p>

          <a
            href={appUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#e11d48] to-[#db2777] px-5 py-3.5 text-sm font-extrabold text-white shadow-[0_0_28px_rgba(225,29,72,0.45)] transition hover:brightness-110 active:scale-[0.99] sm:text-base"
            onClick={() => dismiss()}
          >
            Open App
          </a>

          <p className="mt-3 text-xs font-medium tracking-wide text-zinc-500">
            100% Free • No download required
          </p>
        </div>
      </div>
    </div>
  );
}
