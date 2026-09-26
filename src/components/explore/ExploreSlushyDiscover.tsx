"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { ExploreJerkmatePromoBanner } from "@/components/explore/ExploreJerkmatePromoBanner";
import { ExploreSlushyGrid } from "@/components/explore/ExploreSlushyGrid";
import { ExplorePerformerGridSkeleton } from "@/components/explore/ExplorePerformerGridSkeleton";
import {
  EXPLORE_CATALOG_MENU,
  resolveExploreCategory,
} from "@/lib/explore/exploreCatalog";
import { EXPLORE_DISPLAY_LIMIT } from "@/lib/explore/exploreLimits";
import {
  filterPerformersBySearch,
  filterPerformersByTagSlug,
  sortPerformers,
  type ExploreSortMode,
} from "@/lib/explore/exploreGrid";
import { filterPerformersForCategory } from "@/lib/explore/fetchCategoryPerformers";
import { explorePathForCategoryParam } from "@/lib/explore/paths";
import {
  performerDisplayHandle,
  performerProfilePathFromPerformer,
} from "@/lib/profile/performerHandle";

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
  { id: "teen", label: "teen" },
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

function horizontalScrollClass(): string {
  return "flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
}

function chipClass(active: boolean): string {
  return [
    "shrink-0 cursor-pointer rounded-full px-3.5 py-2 text-[11px] font-bold transition active:scale-[0.98] touch-manipulation select-none",
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
  poolLoading = false,
}: ExploreSlushyDiscoverProps) {
  const router = useRouter();
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
    return [...masterPool]
      .filter((p) => p.live !== false)
      .sort((a, b) => (b.systemScore ?? 0) - (a.systemScore ?? 0))
      .slice(0, 14);
  }, [masterPool]);

  const promoModel = liveStories[0] ?? basePerformers[0];
  const promoUrl = promoModel ? buildModelAffiliateUrl(promoModel) : "/";
  const promoImage = promoModel ? pickCoverUrl(promoModel) : null;

  const showSkeleton = loading || (poolLoading && basePerformers.length === 0);
  const category = resolveExploreCategory(activeCat);

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

  return (
    <div className="space-y-4 pb-1">
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
          placeholder="Search models"
          className="w-full rounded-full bg-[#1a1a1e] py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-zinc-500 outline-none ring-1 ring-white/[0.06] focus:ring-pink-500/35"
          autoComplete="off"
          enterKeyHint="search"
        />
      </div>

      <div className={horizontalScrollClass()}>
        {SORT_CHIPS.map((chip) => {
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
        })}
      </div>

      <div className={horizontalScrollClass()}>
        {TAG_CHIPS.map((chip) => {
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
        })}
      </div>

      {showCategoryPicker && (
        <div className={horizontalScrollClass()}>
          <button
            type="button"
            className={chipClass(!activeCat)}
            onClick={() => loadCategory(null)}
          >
            All
          </button>
          {EXPLORE_CATALOG_MENU.map(({ slug, label }) => (
            <button
              key={slug}
              type="button"
              className={chipClass(activeCat === slug)}
              onClick={() => loadCategory(slug)}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {liveStories.length > 0 && (
        <div className={horizontalScrollClass()}>
          {liveStories.map((performer) => {
            const path = performerProfilePathFromPerformer(performer);
            const handle = performerDisplayHandle(
              performer.nameClean || performer.name,
            );
            const thumb = pickCoverUrl(performer);
            const inner = (
              <div className="flex w-[76px] flex-col items-center gap-1.5">
                <div
                  className="rounded-[24px] p-[2px]"
                  style={{
                    background:
                      "linear-gradient(135deg, #ff2d92 0%, #e879f9 40%, #a855f7 100%)",
                  }}
                >
                  <div className="relative h-[72px] w-[72px] overflow-hidden rounded-[22px] bg-[#1C1C1E]">
                    {thumb ? (
                      <Image
                        src={thumb}
                        alt={handle}
                        fill
                        className="object-cover"
                        sizes="76px"
                        unoptimized
                      />
                    ) : (
                      <div className="h-full w-full bg-zinc-800" />
                    )}
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent pb-1 pt-3 text-center text-[8px] font-black uppercase tracking-wide text-white">
                      Live
                    </span>
                  </div>
                </div>
                <span className="max-w-[76px] truncate text-[10px] font-bold text-zinc-100">
                  {handle.replace(/^@/, "")}
                </span>
              </div>
            );
            return path ? (
              <Link key={performer.itemId ?? handle} href={path} className="shrink-0">
                {inner}
              </Link>
            ) : (
              <div key={performer.itemId ?? handle} className="shrink-0">
                {inner}
              </div>
            );
          })}
        </div>
      )}

      {promoModel && (
        <ExploreJerkmatePromoBanner
          affiliateUrl={promoUrl}
          coverUrl={promoImage}
        />
      )}

      <section>
        <div className="mb-2.5 flex items-center justify-between px-0.5">
          <h2 className="text-[11px] font-black uppercase tracking-wider text-zinc-400">
            {category ? category.label : "For you"}
          </h2>
          <span className="text-[10px] font-semibold text-zinc-600">
            {isPending || showSkeleton
              ? "…"
              : `${displayedPerformers.length} / ${total}`}
          </span>
        </div>
        {showSkeleton ? (
          <ExplorePerformerGridSkeleton count={8} columns={2} />
        ) : (
          <ExploreSlushyGrid performers={displayedPerformers} />
        )}
      </section>
    </div>
  );
}
