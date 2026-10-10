"use client";

import { useEffect, useMemo, useState } from "react";
import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { ExplorePerformerGridSkeleton } from "@/components/explore/ExplorePerformerGridSkeleton";
import { ExploreTubeGrid } from "@/components/explore/ExploreTubeGrid";
import { resolveExploreCategory } from "@/lib/explore/exploreCatalog";
import {
  filterPerformersBySearch,
  sortPerformers,
  type ExploreSortMode,
} from "@/lib/explore/exploreGrid";
import type { ExploreServerBootstrap } from "@/lib/explore/getExploreServerBootstrap";

const SORT_CHIPS: { id: ExploreSortMode; label: string }[] = [
  { id: "hot", label: "Hottest" },
  { id: "trending", label: "Trending" },
  { id: "all", label: "All" },
];

type ExploreHubCategoryClientProps = {
  categorySlug: string;
  bootstrap: ExploreServerBootstrap | null;
};

export function ExploreHubCategoryClient({
  categorySlug,
  bootstrap,
}: ExploreHubCategoryClientProps) {
  const category = resolveExploreCategory(categorySlug);
  const [performers, setPerformers] = useState<CrackPerformer[]>(
    bootstrap?.performers ?? [],
  );
  const [total, setTotal] = useState(bootstrap?.total ?? 0);
  const [loading, setLoading] = useState(!bootstrap?.performers?.length);
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<ExploreSortMode>("hot");

  useEffect(() => {
    let cancelled = false;
    void fetch(`/api/explore/category?cat=${encodeURIComponent(categorySlug)}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        setPerformers(json.performers ?? []);
        setTotal(json.total ?? 0);
      })
      .catch(() => {
        /* keep SSR bootstrap */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [categorySlug]);

  const displayed = useMemo(() => {
    let list = [...performers];
    list = filterPerformersBySearch(list, search);
    list = sortPerformers(list, sortMode);
    return list;
  }, [performers, search, sortMode]);

  return (
    <section aria-labelledby="hub-live-grid-heading">
      <div className="mb-3 space-y-2.5">
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" />
            </svg>
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${category?.label ?? "models"}`}
            className="w-full rounded-full bg-[#1a1a1e] py-3 pl-11 pr-4 text-[16px] text-white placeholder:text-zinc-500 outline-none ring-1 ring-white/[0.06] focus:ring-[#39FF14]/35 lg:text-sm touch-manipulation"
            autoComplete="off"
          />
        </div>

        <div className="nx-chip-scroll hide-scrollbar flex gap-2 overflow-x-auto pb-0.5">
          {SORT_CHIPS.map((chip) => {
            const active = sortMode === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setSortMode(chip.id)}
                className={[
                  "shrink-0 rounded-full px-3.5 py-2 text-[11px] font-bold transition active:scale-[0.98]",
                  active
                    ? "bg-white text-black"
                    : "bg-[#1a1a1e] text-zinc-300 ring-1 ring-white/[0.06]",
                ].join(" ")}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-2.5 flex items-center justify-between px-0.5">
        <h2
          id="hub-live-grid-heading"
          className="text-[11px] font-black uppercase tracking-wider text-zinc-400"
        >
          Live {category?.label ?? "models"}
        </h2>
        <span className="text-[10px] font-semibold text-zinc-600">
          {loading ? "…" : `${displayed.length} / ${total}`}
        </span>
      </div>

      {loading && displayed.length === 0 ? (
        <ExplorePerformerGridSkeleton count={12} />
      ) : (
        <ExploreTubeGrid performers={displayed} />
      )}
    </section>
  );
}
