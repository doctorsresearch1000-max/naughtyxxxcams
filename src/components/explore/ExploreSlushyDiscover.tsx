"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { pickCoverUrl } from "@/lib/crackrevenue/api";
import { buildModelAffiliateUrl } from "@/lib/crackrevenue/affiliate";
import type { ExploreCategory } from "@/lib/crackrevenue/categories";
import { ExploreCategoryGrid } from "@/components/explore/ExploreCategoryGrid";
import { ExploreCategoryPremiumGrid } from "@/components/explore/ExploreCategoryPremiumGrid";
import { resolveExploreCategoryHubCards } from "@/lib/explore/exploreCategoryHubCards";
import { ExploreJerkmatePromoBanner } from "@/components/explore/ExploreJerkmatePromoBanner";
import { ExploreLiveStoriesRow } from "@/components/explore/ExploreLiveStoriesRow";
import { ExploreTubeGrid } from "@/components/explore/ExploreTubeGrid";
import { ExplorePerformerGridSkeleton } from "@/components/explore/ExplorePerformerGridSkeleton";
import {
  EXPLORE_CATALOG_MENU,
  resolveExploreCategory,
} from "@/lib/explore/exploreCatalog";
import { EXPLORE_DISPLAY_LIMIT } from "@/lib/explore/exploreLimits";
import { subscribeExploreSearch } from "@/lib/explore/exploreSearchSync";
import {
  filterPerformersBySearch,
  filterPerformersByTagSlug,
  sortPerformers,
  type ExploreSortMode,
} from "@/lib/explore/exploreGrid";
import { filterPerformersForCategory } from "@/lib/explore/fetchCategoryPerformers";
import { dedupeById } from "@/lib/feed/dedupeById";
import { getPerformerKey } from "@/lib/crackrevenue/api";
import { explorePathForCategoryParam } from "@/lib/explore/paths";

type CacheEntry = {
  performers: CrackPerformer[];
  total: number;
};

const SORT_CHIPS: { id: ExploreSortMode | "filter"; label: string }[] = [
  { id: "filter", label: "Filter" },
  { id: "hot", label: "Hottest" },
  { id: "trending", label: "Trending" },
  { id: "all", label: "All" },
];

const TAG_CHIPS: { id: string | null; label: string }[] = [
  { id: "__categories__", label: "# Categories" },
  { id: "booty", label: "booty" },
  { id: "boobs", label: "boobs" },
  { id: "milf", label: "milf" },
  { id: "latina", label: "latina" },
];

function cacheKey(cat: string | null): string {
  return cat ?? "__all__";
}

function buildCacheFromPool(pool: CrackPerformer[]): Map<string, CacheEntry> {
  const map = new Map<string, CacheEntry>();
  const all = filterPerformersForCategory(pool, null, pool.length);
  map.set("__all__", {
    performers: all.slice(0, EXPLORE_DISPLAY_LIMIT),
    total: all.length,
  });

  for (const { slug, config } of EXPLORE_CATALOG_MENU) {
    const filtered = filterPerformersForCategory(pool, config, pool.length);
    map.set(slug, {
      performers: filtered.slice(0, EXPLORE_DISPLAY_LIMIT),
      total: filtered.length,
    });
  }

  return map;
}

const horizontalScrollClass =
  "nx-chip-scroll hide-scrollbar flex gap-2 overflow-x-auto overflow-y-visible pb-0.5";

function chipClass(active: boolean): string {
  return [
    "shrink-0 cursor-pointer rounded-full px-3.5 py-2 text-[11px] font-bold transition active:scale-[0.98] touch-manipulation select-none lg:px-3 lg:py-1.5 lg:text-[10px]",
    active
      ? "bg-white text-black shadow-sm"
      : "bg-[#1a1a1e] text-zinc-300 ring-1 ring-white/[0.06] hover:bg-[#25252a]",
  ].join(" ");
}

type ExploreSlushyDiscoverProps = {
  initialCat: string | null;
  initialPerformers: CrackPerformer[];
  initialTotal: number;
  masterPool: CrackPerformer[];
  popularCategories: ExploreCategory[];
  poolLoading?: boolean;
};

export function ExploreSlushyDiscover({
  initialCat,
  initialPerformers,
  initialTotal,
  masterPool,
  popularCategories,
  poolLoading = false,
}: ExploreSlushyDiscoverProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [activeCat, setActiveCat] = useState<string | null>(initialCat);
  const [basePerformers, setBasePerformers] =
    useState<CrackPerformer[]>(initialPerformers);
  const [total, setTotal] = useState(initialTotal);
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<ExploreSortMode>("all");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());

  useEffect(() => {
    setActiveCat(initialCat);
  }, [initialCat]);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q != null) setSearch(q);
  }, [searchParams]);

  useEffect(() => subscribeExploreSearch(setSearch), []);

  useEffect(() => {
    const built = buildCacheFromPool(masterPool);
    cacheRef.current = built;
    const key = cacheKey(initialCat);
    const entry = built.get(key);
    if (entry) {
      setBasePerformers(entry.performers);
      setTotal(entry.total);
    } else {
      cacheRef.current.set(key, {
        performers: initialPerformers,
        total: initialTotal,
      });
    }
  }, [masterPool, initialCat, initialPerformers, initialTotal]);

  const applyEntry = useCallback((cat: string | null, entry: CacheEntry) => {
    setActiveCat(cat);
    setBasePerformers(entry.performers);
    setTotal(entry.total);
    setSearch("");
    setActiveTag(null);
    setShowCategoryPicker(false);
  }, []);

  const loadCategory = useCallback(
    (slug: string | null) => {
      const key = cacheKey(slug);
      const cached = cacheRef.current.get(key);

      if (cached) {
        startTransition(() => {
          applyEntry(slug, cached);
          const href = explorePathForCategoryParam(slug);
          router.replace(href, { scroll: false });
        });
        return;
      }

      setLoading(true);
      void fetch(`/api/explore/category${slug ? `?cat=${slug}` : ""}`)
        .then((res) => res.json())
        .then((json: CacheEntry) => {
          const entry: CacheEntry = {
            performers: json.performers ?? [],
            total: json.total ?? 0,
          };
          cacheRef.current.set(key, entry);
          startTransition(() => {
            applyEntry(slug, entry);
            const href = explorePathForCategoryParam(slug);
            router.replace(href, { scroll: false });
          });
        })
        .catch(() => {
          startTransition(() => {
            applyEntry(slug, { performers: [], total: 0 });
          });
        })
        .finally(() => setLoading(false));
    },
    [applyEntry, router],
  );

  const displayedPerformers = useMemo(() => {
    let list = [...basePerformers];
    list = filterPerformersBySearch(list, search);
    if (activeTag && activeTag !== "__categories__") {
      list = filterPerformersByTagSlug(list, activeTag);
    }
    list = sortPerformers(list, sortMode);
    return list;
  }, [basePerformers, search, activeTag, sortMode]);

  const liveStories = useMemo(() => {
    const sorted = [...masterPool]
      .filter((p) => p.live !== false)
      .sort((a, b) => (b.systemScore ?? 0) - (a.systemScore ?? 0));
    return dedupeById(sorted, (p) => getPerformerKey(p)).slice(0, 14);
  }, [masterPool]);

  const gridPerformers = useMemo(() => {
    const storyKeys = new Set(liveStories.map((p) => getPerformerKey(p)));
    return dedupeById(
      displayedPerformers.filter((p) => !storyKeys.has(getPerformerKey(p))),
      (p) => getPerformerKey(p),
    );
  }, [displayedPerformers, liveStories]);

  const promoModel = liveStories[0] ?? basePerformers[0];
  const promoUrl = promoModel ? buildModelAffiliateUrl(promoModel) : "";
  const promoImage = promoModel ? pickCoverUrl(promoModel) : null;

  const showSkeleton = loading || (poolLoading && basePerformers.length === 0);
  const category = resolveExploreCategory(activeCat);
  const showCategoryHub = !search.trim();

  const categoryHubCards = useMemo(
    () => resolveExploreCategoryHubCards(masterPool, popularCategories),
    [masterPool, popularCategories],
  );

  const onSortChip = (id: ExploreSortMode | "filter") => {
    if (id === "filter") {
      setSearch("");
      setActiveTag(null);
      setSortMode("all");
      setShowCategoryPicker(false);
      if (activeCat) {
        loadCategory(null);
      }
      return;
    }
    setSortMode(id);
  };

  const onTagChip = (id: string | null) => {
    if (id === "__categories__") {
      setShowCategoryPicker((v) => !v);
      setActiveTag(null);
      return;
    }
    setShowCategoryPicker(false);
    setActiveTag((prev) => (prev === id ? null : id));
  };

  const sortChipButtons = SORT_CHIPS.map((chip) => {
    const active =
      chip.id === "filter"
        ? !search && !activeTag && sortMode === "all" && !activeCat
        : chip.id === sortMode;
    return (
      <button
        key={chip.label}
        type="button"
        onClick={() => onSortChip(chip.id)}
        className={chipClass(active)}
      >
        {chip.id === "filter" ? (
          <span className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M4 6h16M7 12h10M10 18h4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            {chip.label}
          </span>
        ) : (
          chip.label
        )}
      </button>
    );
  });

  const tagChipButtons = TAG_CHIPS.map((chip) => {
    const active =
      chip.id === "__categories__"
        ? showCategoryPicker
        : activeTag === chip.id;
    return (
      <button
        key={chip.label}
        type="button"
        onClick={() => onTagChip(chip.id)}
        className={chipClass(active)}
      >
        {chip.label}
      </button>
    );
  });

  const categoryChipButtons = useMemo(() => {
    if (!showCategoryPicker) return null;
    return [
      <button
        key="all-cat"
        type="button"
        className={chipClass(!activeCat)}
        onClick={() => loadCategory(null)}
      >
        All
      </button>,
      ...EXPLORE_CATALOG_MENU.map(({ slug, label }) => (
        <button
          key={slug}
          type="button"
          className={chipClass(activeCat === slug)}
          onClick={() => loadCategory(slug)}
        >
          {label}
        </button>
      )),
    ];
  }, [showCategoryPicker, activeCat, loadCategory]);

  return (
    <div className="space-y-4 pb-1 lg:space-y-2">
      <div className="relative lg:hidden">
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
          placeholder="Search models"
          className="w-full rounded-full bg-[#1a1a1e] py-3.5 pl-11 pr-4 text-[16px] leading-normal text-white placeholder:text-zinc-500 outline-none ring-1 ring-white/[0.06] focus:ring-pink-500/35 lg:text-sm touch-manipulation"
          autoComplete="off"
          enterKeyHint="search"
          inputMode="search"
        />
      </div>

      <div
        className="sticky top-[calc(var(--app-header-height,0px)+2px)] z-20 -mx-1 space-y-2 bg-[#0d0d0f]/95 py-2 backdrop-blur-md supports-[backdrop-filter]:bg-[#0d0d0f]/80"
      >
        <div className={`${horizontalScrollClass} hidden lg:flex`}>
          {sortChipButtons}
          {tagChipButtons}
          {showCategoryPicker ? categoryChipButtons : null}
        </div>

        <div className={`${horizontalScrollClass} lg:hidden`}>
          {sortChipButtons}
        </div>

        <div className={`${horizontalScrollClass} lg:hidden`}>
          {tagChipButtons}
        </div>

        {showCategoryPicker ? (
          <div className={`${horizontalScrollClass} lg:hidden`}>
            {categoryChipButtons}
          </div>
        ) : null}
      </div>

      <ExploreLiveStoriesRow performers={liveStories} />

      {promoUrl ? (
        <ExploreJerkmatePromoBanner
          affiliateUrl={promoUrl}
          coverUrl={promoImage}
        />
      ) : null}

      {showCategoryHub ? (
        <section className="mb-2">
          <div className="mb-2.5 flex items-center justify-between px-0.5">
            <h2 className="text-[11px] font-black uppercase tracking-wider text-zinc-400">
              Popular categories
            </h2>
            {popularCategories.length > 0 ? (
              <span className="text-[10px] font-semibold text-zinc-600">
                {popularCategories.length} active
              </span>
            ) : null}
          </div>
          <ExploreCategoryPremiumGrid cards={categoryHubCards} />
        </section>
      ) : null}

      <section className="mt-2 lg:mt-4">
        <div className="mb-2.5 flex items-center justify-between px-0.5 lg:mb-1">
          <h2 className="text-[11px] font-black uppercase tracking-wider text-zinc-400">
            {category ? category.label : "For you"}
          </h2>
          <span className="text-[10px] font-semibold text-zinc-600">
            {isPending || showSkeleton
              ? "…"
              : `${gridPerformers.length} / ${total}`}
          </span>
        </div>
        {showSkeleton ? (
          <ExplorePerformerGridSkeleton count={12} />
        ) : (
          <ExploreTubeGrid performers={gridPerformers} />
        )}
      </section>
    </div>
  );
}
