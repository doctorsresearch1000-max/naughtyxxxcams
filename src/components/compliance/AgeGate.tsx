"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "age_verified";

export function AgeGate() {
  const [mounted, setMounted] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    try {
      setVerified(window.localStorage.getItem(STORAGE_KEY) === "true");
    } catch {
      setVerified(false);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || verified) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted, verified]);

  const confirm = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      /* ignore quota / private mode */
    }
    setVerified(true);
  }, []);

  const exit = useCallback(() => {
    window.location.href = "https://www.google.com";
  }, []);

  if (!mounted || verified) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
    >
      <div
        className="max-w-md w-full rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--nx-action)]">
          18+ Entry Warning
        </p>
        <h2
          id="age-gate-title"
          className="mt-2 text-lg font-bold text-white"
        >
          Adults only
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          This website contains age-restricted materials including nudity and
          sexually explicit content. By entering, you confirm that you are at
          least 18 years old (or the age of majority in your jurisdiction) and
          agree to our Terms of use.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={confirm}
            className="flex-1 rounded-full bg-[var(--nx-action)] px-4 py-3 text-sm font-bold text-black"
          >
            I am 18 or older — Enter
          </button>
          <button
            type="button"
            onClick={exit}
            className="flex-1 rounded-full border border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-300"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}
