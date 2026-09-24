"use client";

import {
  EXPLORE_CATEGORY_SLUGS,
  EXPLORE_CATEGORY_MAP,
} from "@/lib/explore/categorySlugs";

type ExploreCategoryTabsProps = {
  activeCat: string | null;
  isPending?: boolean;
  onSelectCategory: (slug: string | null) => void;
};

export function ExploreCategoryTabs({
  activeCat,
  isPending = false,
  onSelectCategory,
}: ExploreCategoryTabsProps) {
  const pillClass = (active: boolean) =>
    `shrink-0 rounded-full border px-3.5 py-2 text-[11px] font-bold uppercase tracking-wide transition active:scale-95 disabled:opacity-60 ${
      active
        ? "border-pink-500 bg-pink-600/25 text-pink-100 shadow-[0_0_12px_rgba(236,72,153,0.35)]"
        : "border-zinc-700 bg-zinc-900/90 text-zinc-300 hover:border-pink-500/40 hover:text-white"
    }`;

  return (
    <div
      className={`hide-scrollbar -mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-1 ${isPending ? "opacity-90" : ""}`}
      role="tablist"
      aria-label="Live categories"
      aria-busy={isPending}
    >
      <button
        type="button"
        role="tab"
        aria-selected={!activeCat}
        disabled={isPending}
        className={pillClass(!activeCat)}
        onClick={() => onSelectCategory(null)}
      >
        All
      </button>
      {EXPLORE_CATEGORY_SLUGS.map((slug) => {
        const config = EXPLORE_CATEGORY_MAP[slug];
        const active = activeCat === slug;
        return (
          <button
            key={slug}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={isPending}
            className={pillClass(active)}
            onClick={() => onSelectCategory(slug)}
          >
            {config.label}
          </button>
        );
      })}
    </div>
  );
}
