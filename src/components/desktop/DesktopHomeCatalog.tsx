"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRegistrationPaywall } from "@/components/auth/RegistrationPaywallProvider";
import { useTelegramAuth } from "@/components/auth/TelegramAuthProvider";
import { DesktopLiveModelCard } from "@/components/desktop/DesktopLiveModelCard";
import {
  applyDesktopCatalogFilters,
  DESKTOP_CATEGORY_PILLS,
  type DesktopCatalogFilters,
  type DesktopLanguageFilter,
  type DesktopQualityFilter,
  type DesktopShowTypeFilter,
} from "@/lib/desktop/desktopCatalogFilters";
import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import { performerProfilePathFromPerformer } from "@/lib/profile/performerHandle";

const DEFAULT_FILTERS: DesktopCatalogFilters = {
  search: "",
  language: "any",
  quality: "any",
  showType: "any",
  interactiveToy: false,
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
    <label className="flex min-w-0 flex-col gap-1">
      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="h-9 rounded-lg border border-white/10 bg-[#1a1a1c] px-2 text-xs font-semibold text-zinc-100 outline-none focus:border-[#39FF14]/50"
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

export function DesktopHomeCatalog() {
  const router = useRouter();
  const { isAuthenticated } = useTelegramAuth();
  const { requireAccount } = useRegistrationPaywall();
  const [performers, setPerformers] = useState<FeedPerformer[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "empty">(
    "loading",
  );
  const [filters, setFilters] = useState<DesktopCatalogFilters>(DEFAULT_FILTERS);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/performers", { cache: "no-store" });
        const json = (await res.json()) as { performers?: FeedPerformer[] };
        if (cancelled) return;
        const list = Array.isArray(json.performers) ? json.performers : [];
        setPerformers(list);
        setLoadState(list.length > 0 ? "ready" : "empty");
      } catch {
        setLoadState("empty");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () => applyDesktopCatalogFilters(performers, filters),
    [performers, filters],
  );

  const liveCount = useMemo(
    () => performers.filter((p) => p.live !== false).length,
    [performers],
  );

  const openModel = useCallback(
    (performer: FeedPerformer) => {
      if (!requireAccount()) return;
      const path = performerProfilePathFromPerformer(performer);
      if (path) router.push(path);
    },
    [requireAccount, router],
  );

  const setCategory = (id: string | null) => {
    setFilters((f) => ({ ...f, categorySlug: id }));
  };

  return (
    <main className="hidden min-h-0 w-full flex-1 flex-col bg-black text-white lg:flex">
      <div className="border-b border-white/10 bg-[#0a0a0a]/95 px-4 pb-3 pt-[calc(var(--app-header-height)+0.75rem)] backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3">
          <div className="relative">
            <span
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              aria-hidden
            >
              🔍
            </span>
            <input
              type="search"
              value={filters.search}
              onChange={(e) =>
                setFilters((f) => ({ ...f, search: e.target.value }))
              }
              placeholder="Search models, tags, categories…"
              className="h-11 w-full rounded-xl border border-white/10 bg-[#141416] pl-10 pr-24 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-[#39FF14]/40"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-[#39FF14]/15 px-2.5 py-1 text-xs font-bold text-[#39FF14]">
              {liveCount} live
            </span>
          </div>

          <div className="flex flex-wrap items-end gap-3">
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
            <SelectField<DesktopShowTypeFilter>
              label="Show type"
              value={filters.showType}
              onChange={(showType) => setFilters((f) => ({ ...f, showType }))}
              options={[
                { value: "any", label: "Any" },
                { value: "solo", label: "Solo" },
                { value: "couple", label: "Couple" },
              ]}
            />
            <label className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-[#1a1a1c] px-3 text-xs font-semibold text-zinc-200">
              <input
                type="checkbox"
                checked={filters.interactiveToy}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    interactiveToy: e.target.checked,
                  }))
                }
                className="accent-[#39FF14]"
              />
              Interactive toy
            </label>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {DESKTOP_CATEGORY_PILLS.map((pill) => {
              const active = filters.categorySlug === pill.id;
              return (
                <button
                  key={pill.label}
                  type="button"
                  onClick={() => setCategory(pill.id)}
                  className={`shrink-0 rounded-lg px-3 py-2 text-[11px] font-bold tracking-wide transition ${
                    active
                      ? "bg-[#2f7bff] text-white"
                      : "bg-[#1c1c1e] text-zinc-300 hover:bg-[#2a2a2e]"
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
            <Link
              href="/explore"
              className="shrink-0 rounded-lg bg-[#1c1c1e] px-3 py-2 text-[11px] font-bold tracking-wide text-zinc-300 hover:bg-[#2a2a2e]"
            >
              DIRECTORY
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-5">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h1 className="text-2xl font-black tracking-tight">Live cams</h1>
            <p className="text-sm text-zinc-500">
              Hover to preview · Click to open immersive room view
              {isAuthenticated ? "" : " · Sign in to watch"}
            </p>
          </div>
          <p className="text-xs font-semibold text-zinc-500">
            {filtered.length} models
          </p>
        </div>

        {loadState === "loading" ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#39FF14]/30 border-t-[#39FF14]" />
          </div>
        ) : null}

        {loadState === "empty" ? (
          <p className="rounded-xl bg-[#1c1c1e] p-6 text-center text-sm text-zinc-400">
            Live performers are temporarily unavailable. Try again in a moment.
          </p>
        ) : null}

        {loadState === "ready" && filtered.length === 0 ? (
          <p className="rounded-xl bg-[#1c1c1e] p-6 text-center text-sm text-zinc-400">
            No models match your filters. Try clearing a category or search.
          </p>
        ) : null}

        {filtered.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {filtered.map((performer) => (
              <DesktopLiveModelCard
                key={performer.feedKey}
                performer={performer}
                onSelect={() => openModel(performer)}
              />
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}
