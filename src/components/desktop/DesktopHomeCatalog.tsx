"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DesktopImmersiveRoomDialog } from "@/components/desktop/DesktopImmersiveRoomDialog";
import { HomeTubeGrid } from "@/components/home/HomeTubeGrid";
import {
  applyDesktopCatalogFilters,
  DESKTOP_CATEGORY_PILLS,
  type DesktopCatalogFilters,
  type DesktopLanguageFilter,
  type DesktopQualityFilter,
} from "@/lib/desktop/desktopCatalogFilters";
import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import { HomeCatalogSectionTitle } from "@/components/home/HomeCatalogSectionTitle";
import {
  CATALOG_GRID_CLASS,
  CATALOG_PAGE_PADDING,
} from "@/lib/layout/catalogGridLayout";
import { injectStreamPreconnects } from "@/lib/feed/streamEmbedWarmup";
import { subscribeHomeCatalogSearch } from "@/lib/home/homeCatalogSearchSync";

const DEFAULT_FILTERS: DesktopCatalogFilters = {
  search: "",
  language: "any",
  quality: "any",
  categorySlug: "trending",
  sort: "trending",
};

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <label className="flex min-w-0 shrink-0 items-center gap-1.5">
      <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="h-8 min-w-[5.5rem] rounded-lg border border-zinc-800 bg-zinc-900 px-2 text-[11px] font-semibold text-zinc-100 outline-none focus:border-[#39FF14]/60 focus:ring-1 focus:ring-[#39FF14]/25"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

type DesktopHomeCatalogProps = {
  initialPerformers?: FeedPerformer[];
};

export function DesktopHomeCatalog({
  initialPerformers = [],
}: DesktopHomeCatalogProps) {
  const [performers, setPerformers] = useState<FeedPerformer[]>(
    initialPerformers,
  );
  const [loadState, setLoadState] = useState<"loading" | "ready" | "empty">(
    initialPerformers.length > 0 ? "ready" : "loading",
  );
  const [filters, setFilters] = useState<DesktopCatalogFilters>(DEFAULT_FILTERS);
  const [roomPerformer, setRoomPerformer] = useState<FeedPerformer | null>(
    null,
  );

  useEffect(() => {
    injectStreamPreconnects();
  }, []);

  useEffect(() => {
    return subscribeHomeCatalogSearch((query) => {
      setFilters((f) => ({ ...f, search: query }));
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/performers?maxPages=2", {
          cache: "no-store",
        });
        const json = (await res.json()) as { performers?: FeedPerformer[] };
        if (cancelled) return;
        const list = Array.isArray(json.performers) ? json.performers : [];
        if (list.length > 0) {
          setPerformers(list);
          setLoadState("ready");
        } else if (performers.length === 0) {
          setLoadState("empty");
        }
      } catch {
        if (performers.length === 0) setLoadState("empty");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [performers.length]);

  const filtered = useMemo(
    () => applyDesktopCatalogFilters(performers, filters),
    [performers, filters],
  );

  const liveCount = useMemo(
    () => performers.filter((p) => p.live !== false).length,
    [performers],
  );

  const openLiveRoom = useCallback((performer: FeedPerformer) => {
    setRoomPerformer(performer);
  }, []);

  const setCategory = (id: string | null) => {
    setFilters((f) => ({ ...f, categorySlug: id }));
  };

  return (
    <main className={`${CATALOG_PAGE_PADDING} hidden w-full max-w-none flex-col overflow-x-hidden bg-zinc-950 text-white lg:flex`}>
      <DesktopImmersiveRoomDialog
        performer={roomPerformer}
        onClose={() => setRoomPerformer(null)}
      />

      <HomeCatalogSectionTitle liveCount={liveCount} />

      <div className="border-b border-zinc-800/80 bg-zinc-950/95 pb-2 pt-1 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-2">
          <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <SelectField<DesktopLanguageFilter>
              label="Language"
              value={filters.language}
              onChange={(language) => setFilters((f) => ({ ...f, language }))}
              options={[
                { value: "any", label: "Any" },
                { value: "en", label: "English" },
                { value: "es", label: "Spanish" },
                { value: "fr", label: "French" },
              ]}
            />
            <SelectField<DesktopQualityFilter>
              label="Quality"
              value={filters.quality}
              onChange={(quality) => setFilters((f) => ({ ...f, quality }))}
              options={[
                { value: "any", label: "Any" },
                { value: "hd", label: "HD" },
              ]}
            />
          </div>

          <div className="nx-chip-scroll flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {DESKTOP_CATEGORY_PILLS.map((pill) => {
              const active = filters.categorySlug === pill.id;
              return (
                <button
                  key={pill.label}
                  type="button"
                  onClick={() => setCategory(pill.id)}
                  className={`shrink-0 rounded-lg px-3 py-2 text-[11px] font-bold tracking-wide transition ${
                    active
                      ? "bg-[#39FF14] text-black shadow-[0_0_16px_rgba(57,255,20,0.25)]"
                      : "bg-zinc-900 text-zinc-300 ring-1 ring-zinc-800 hover:ring-[#39FF14]/35"
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1800px] flex-1 py-2">
        <div className="mb-3 flex flex-wrap items-baseline justify-end gap-2">
          <p className="text-xs font-semibold text-zinc-500">
            Showing {filtered.length} of {filtered.length} ·{" "}
            {performers.length} live in catalog
          </p>
        </div>

        {loadState === "loading" ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#39FF14]/30 border-t-[#39FF14]" />
          </div>
        ) : null}

        {loadState === "empty" ? (
          <p className="rounded-xl bg-zinc-900 p-6 text-center text-sm text-zinc-400 ring-1 ring-zinc-800">
            Live performers are temporarily unavailable. Try again in a moment.
          </p>
        ) : null}

        {loadState === "ready" && filtered.length === 0 ? (
          <p className="rounded-xl bg-zinc-900 p-6 text-center text-sm text-zinc-400 ring-1 ring-zinc-800">
            No models match your filters. Try clearing a category or search.
          </p>
        ) : null}

        {filtered.length > 0 ? (
          <HomeTubeGrid
            performers={filtered}
            gridClassName={CATALOG_GRID_CLASS}
            enableDesktopPreview
            onQuickView={openLiveRoom}
            emptyMessage="No models match your filters."
          />
        ) : null}
      </div>
    </main>
  );
}
