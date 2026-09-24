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
      className="absolute left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-white/10 bg-neutral-950/40 px-4 py-3 backdrop-blur-md"
    >
      <Link href="/" className="group flex items-center gap-2">
        <Image
          src="/logo.png"
          alt="NaughtyXXXCams Logo"
          width={150}
          height={40}
          className="h-10 w-auto object-contain transition-transform group-hover:scale-105 md:h-12"
          priority
        />
      </Link>

      <div className="flex items-center gap-3">
        <LiveStatusPill />
      </div>
    </header>
  );
}
