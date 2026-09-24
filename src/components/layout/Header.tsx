"use client";

import { useEffect, useState } from "react";
import { SlushyBrandLogo } from "@/components/brand/SlushyBrandLogo";

function LiveStatusPill() {
  const [count, setCount] = useState<number>(36);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/performers", { cache: "no-store" });
        const json = (await res.json()) as { performers?: unknown[] };
        if (cancelled) return;
        const n = Array.isArray(json.performers) ? json.performers.length : 0;
        if (n > 0) setCount(n);
      } catch {
        /* keep default */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className="flex items-center gap-2 rounded-full border border-[#39FF14]/25 bg-black/50 px-3.5 py-1.5 text-xs text-white backdrop-blur-md"
      aria-label="Models live now"
    >
      <span className="h-2 w-2 animate-pulse rounded-full bg-[#39FF14] shadow-[0_0_8px_#39FF14]" />
      <span className="font-semibold tracking-wide text-[#39FF14]">LIVE</span>
      <span className="text-neutral-500">|</span>
      <span className="font-semibold text-white">{count}</span>
    </div>
  );
}

export function Header() {
  return (
    <header
      className="absolute left-0 right-0 top-0 z-50 flex min-h-[var(--app-header-height)] items-center justify-between gap-3 border-b border-white/10 bg-[#0A0A0A]/75 px-4 py-2.5 backdrop-blur-md"
    >
      <SlushyBrandLogo variant="header" href="/" />
      <div className="flex shrink-0 items-center gap-3">
        <LiveStatusPill />
      </div>
    </header>
  );
}
