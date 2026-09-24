"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  EXPLORE_CATEGORY_SLUGS,
  EXPLORE_CATEGORY_MAP,
} from "@/lib/explore/categorySlugs";

export function ExploreCategoryTabs() {
  const searchParams = useSearchParams();
  const activeCat = searchParams.get("cat")?.toLowerCase() ?? null;

  const pillClass = (active: boolean) =>
    `shrink-0 rounded-full border px-3.5 py-2 text-[11px] font-bold uppercase tracking-wide transition active:scale-95 ${
      active
        ? "border-pink-500 bg-pink-600/25 text-pink-100 shadow-[0_0_12px_rgba(236,72,153,0.35)]"
        : "border-zinc-700 bg-zinc-900/90 text-zinc-300 hover:border-pink-500/40 hover:text-white"
    }`;

  return (
    <div
      className="hide-scrollbar -mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-1"
      role="tablist"
      aria-label="Categorías en vivo"
    >
      <Link
        href="/explore"
        role="tab"
        aria-selected={!activeCat}
        className={pillClass(!activeCat)}
      >
        Todas
      </Link>
      {EXPLORE_CATEGORY_SLUGS.map((slug) => {
        const config = EXPLORE_CATEGORY_MAP[slug];
        const active = activeCat === slug;
        return (
          <Link
            key={slug}
            href={`/explore?cat=${slug}`}
            role="tab"
            aria-selected={active}
            className={pillClass(active)}
          >
            {config.label}
          </Link>
        );
      })}
    </div>
  );
}
