"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function HomeLiveBadge() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/performers", { cache: "no-store" });
        const json = (await res.json()) as { performers?: unknown[] };
        if (cancelled) return;
        const n = Array.isArray(json.performers) ? json.performers.length : 0;
        setCount(n > 0 ? n : null);
      } catch {
        if (!cancelled) setCount(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className="flex shrink-0 items-center gap-2 rounded-full border border-pink-500/30 bg-black/70 px-3 py-1.5 text-xs font-bold shadow-lg backdrop-blur-md"
      aria-label="Transmisiones en vivo"
    >
      <span className="h-2 w-2 animate-pulse rounded-full bg-pink-500" />
      <span className="text-[10px] uppercase tracking-wider text-pink-400">
        LIVE
      </span>
      {count != null && (
        <>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-200">{count}</span>
        </>
      )}
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header
      className="sticky top-0 z-[60] flex min-h-[var(--app-header-height)] shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-neutral-950/90 px-4 py-2.5 backdrop-blur-md"
    >
      <Link
        href="/"
        className="flex min-w-0 shrink-0 items-center"
        aria-label="NaughtyXXXCams — inicio"
      >
        <Image
          src="/logo.png"
          alt="NaughtyXXXCams Logo"
          width={168}
          height={48}
          className="h-10 w-auto max-w-[min(100%,11rem)] object-contain md:h-12"
          priority
        />
      </Link>
      <div className="flex min-w-0 flex-1 items-center justify-end">
        {isHome ? <HomeLiveBadge /> : null}
      </div>
    </header>
  );
}
