"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { SlushyBrandLogo } from "@/components/brand/SlushyBrandLogo";
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
      className="fixed inset-0 z-[160] flex items-end justify-center bg-black/80 p-0 backdrop-blur-md sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="retention-mini-app-title"
      onClick={dismiss}
    >
      <div
        className="relative w-full max-w-[420px] overflow-hidden rounded-t-[1.75rem] border border-white/[0.09] bg-[#0a0a0f] shadow-[0_32px_100px_rgba(0,0,0,0.75)] sm:rounded-[1.75rem]"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-20%,rgba(57,255,20,0.12),transparent_50%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_100%,rgba(219,39,119,0.14),transparent_55%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
          aria-hidden
        />

        <button
          type="button"
          onClick={dismiss}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-lg leading-none text-zinc-400 transition hover:border-[#39FF14]/35 hover:bg-white/[0.07] hover:text-white"
          aria-label="Close"
        >
          ×
        </button>

        <header className="relative border-b border-white/[0.06] px-6 pb-5 pt-8 text-center sm:px-8 sm:pt-9">
          <div
            className="pointer-events-none absolute left-1/2 top-6 h-12 w-48 -translate-x-1/2 rounded-full bg-[#39FF14]/[0.07] blur-2xl"
            aria-hidden
          />
          <div className="relative flex justify-center">
            <SlushyBrandLogo variant="modal" href={null} />
          </div>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
            Official app
          </p>
        </header>

        <div className="relative px-6 pb-7 pt-6 text-center sm:px-8 sm:pb-8">
          <h2
            id="retention-mini-app-title"
            className="text-[1.35rem] font-black leading-snug tracking-tight text-white sm:text-2xl"
          >
            Unlock the Full Naughty Experience
          </h2>

          <p className="mx-auto mt-3 max-w-[19rem] text-sm leading-relaxed text-zinc-400 sm:max-w-sm sm:text-[15px]">
            Open our official app for exclusive live model alerts, VIP access,
            and uninterrupted private chat.
          </p>

          <a
            href={appUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex w-full items-center justify-center rounded-2xl bg-[#39FF14] px-5 py-3.5 text-sm font-extrabold text-black shadow-[0_0_32px_rgba(57,255,20,0.35)] transition hover:brightness-110 active:scale-[0.99] sm:text-base"
            onClick={() => dismiss()}
          >
            Open App
          </a>

          <p className="mt-4 text-[11px] font-medium tracking-wide text-zinc-500 sm:text-xs">
            100% Free • No download required
          </p>
        </div>
      </div>
    </div>
  );
}
