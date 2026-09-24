"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

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
        /* mantener valor por defecto */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className="flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3.5 py-1.5 text-xs text-white backdrop-blur-md"
      aria-label="Modelos en vivo"
    >
      <span className="h-2 w-2 animate-pulse rounded-full bg-pink-500" />
      <span className="font-medium tracking-wide">LIVE</span>
      <span className="text-neutral-400">|</span>
      <span className="font-semibold">{count}</span>
    </div>
  );
}

export function Header() {
  return (
    <header
      className="absolute left-0 right-0 top-0 z-50 flex min-h-[var(--app-header-height)] items-center justify-between gap-3 border-b border-white/10 bg-neutral-950/40 px-4 py-2 backdrop-blur-md"
    >
      <Link
        href="/"
        className="group flex min-w-0 shrink-0 items-center justify-start"
        aria-label="NaughtyXXXCams — inicio"
      >
        <Image
          src="/logo.png"
          alt="NaughtyXXXCams Logo"
          width={132}
          height={36}
          className="h-8 w-auto max-w-[10.5rem] object-contain object-left transition-transform group-hover:scale-[1.02] md:h-8"
          priority
        />
      </Link>

      <div className="flex shrink-0 items-center gap-3">
        <LiveStatusPill />
      </div>
    </header>
  );
}
