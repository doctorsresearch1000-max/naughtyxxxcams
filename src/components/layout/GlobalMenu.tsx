"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  GLOBAL_CONTACT_LINKS,
  GLOBAL_LEGAL_LINKS,
} from "@/lib/site/globalMenuLinks";

function IconMenu({ open }: { open: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="text-white"
    >
      {open ? (
        <>
          <path
            d="M6 6l12 12M18 6 6 18"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <path
            d="M4 7h16M4 12h16M4 17h16"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

export function GlobalMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const panel = open ? (
    <div className="fixed inset-0 z-[100001]" role="dialog" aria-modal="true" aria-label="Site menu">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        aria-label="Close menu"
        onClick={close}
      />
      <aside
        className="absolute right-0 top-0 flex h-full w-[min(100%,320px)] flex-col border-l border-white/10 bg-[#0A0A0A] shadow-2xl"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <p className="text-sm font-bold text-white">Menu</p>
          <button
            type="button"
            onClick={close}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5"
            aria-label="Close menu"
          >
            <IconMenu open />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-[#39FF14]">
            Legal & compliance
          </p>
          <ul className="mb-6 space-y-1">
            {GLOBAL_LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={close}
                  className="block rounded-lg px-2 py-2.5 text-sm text-neutral-200 transition hover:bg-white/5 hover:text-[#39FF14]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-[#39FF14]">
            DMCA & contact
          </p>
          <ul className="space-y-1">
            {GLOBAL_CONTACT_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={close}
                  className="block break-all rounded-lg px-2 py-2.5 text-xs leading-snug text-neutral-400 transition hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <p className="border-t border-white/10 px-4 py-3 text-[10px] leading-relaxed text-neutral-500">
          18+ only. All models were 18 or older at depiction. DMCA and abuse
          contacts are available on every screen via this menu.
        </p>
      </aside>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/50 backdrop-blur-md transition active:scale-95"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        <IconMenu open={open} />
      </button>
      {mounted && panel ? createPortal(panel, document.body) : null}
    </>
  );
}
