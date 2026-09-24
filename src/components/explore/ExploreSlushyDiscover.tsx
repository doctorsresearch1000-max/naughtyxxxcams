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
import { ExploreSlushyGrid } from "@/components/explore/ExploreSlushyGrid";
import { ExplorePerformerGridSkeleton } from "@/components/explore/ExplorePerformerGridSkeleton";
import {
  EXPLORE_CATEGORY_MAP,
  EXPLORE_CATEGORY_SLUGS,
  resolveExploreCategory,
} from "@/lib/explore/categorySlugs";
import {
  filterPerformersBySearch,
  filterPerformersByTagSlug,
  sortPerformers,
  type ExploreSortMode,
} from "@/lib/explore/exploreGrid";
import { filterPerformersForCategory } from "@/lib/explore/fetchCategoryPerformers";
import {
  performerDisplayHandle,
  performerProfilePathFromPerformer,
} from "@/lib/profile/performerHandle";

type CacheEntry = {
  performers: CrackPerformer[];
  total: number;
};

const DISPLAY_LIMIT = 48;

const SORT_CHIPS: { id: ExploreSortMode | "filter"; label: string }[] = [
  { id: "filter", label: "Filter" },
  { id: "hot", label: "Hottest" },
  { id: "trending", label: "Trending" },
  { id: "all", label: "All" },
];

const TAG_CHIPS: { id: string | null; label: string }[] = [
  { id: "__categories__", label: "# Categories" },
  { id: "uncensored", label: "uncensored" },
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
    performers: all.slice(0, DISPLAY_LIMIT),
    total: all.length,
  });

  for (const slug of EXPLORE_CATEGORY_SLUGS) {
    const config = EXPLORE_CATEGORY_MAP[slug];
    const filtered = filterPerformersForCategory(pool, config, pool.length);
    map.set(slug, {
      performers: filtered.slice(0, DISPLAY_LIMIT),
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
    "shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold transition active:scale-[0.98]",
    active
      ? "bg-white text-black"
      : "bg-[#1C1C1E] text-zinc-200 hover:bg-[#2a2a2e]",
  ].join(" ");
}

type ExploreSlushyDiscoverProps = {
  initialCat: string | null;
  initialPerformers: CrackPerformer[];
  initialTotal: number;
  masterPool: CrackPerformer[];
  popularCategories: ExploreCategory[];
};

export function ExploreSlushyDiscover({
  initialCat,
  initialPerformers,
  initialTotal,
  masterPool,
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
  }, []);

  const loadCategory = useCallback(
    (slug: string | null) => {
      const key = cacheKey(slug);
      const cached = cacheRef.current.get(key);

      if (cached) {
        startTransition(() => {
          applyEntry(slug, cached);
          const href = slug ? `/explore?cat=${slug}` : "/explore";
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
            const href = slug ? `/explore?cat=${slug}` : "/explore";
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

  const showSkeleton = loading;
  const category = resolveExploreCategory(activeCat);

  const onSortChip = (id: ExploreSortMode | "filter") => {
    if (id === "filter") {
      setSearch("");
      setActiveTag(null);
      setSortMode("all");
      setShowCategoryPicker(false);
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
    <div className="space-y-4">
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
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
          className="w-full rounded-full bg-[#1C1C1E] py-3 pl-11 pr-4 text-sm text-white placeholder:text-zinc-500 outline-none ring-1 ring-transparent focus:ring-pink-500/40"
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
          {EXPLORE_CATEGORY_SLUGS.map((slug) => (
            <button
              key={slug}
              type="button"
              className={chipClass(activeCat === slug)}
              onClick={() => loadCategory(slug)}
            >
              {EXPLORE_CATEGORY_MAP[slug].label}
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
              <div className="flex w-[72px] flex-col items-center gap-1.5">
                <div
                  className="rounded-[22px] p-[2px]"
                  style={{
                    background:
                      "linear-gradient(135deg, #ff2d92 0%, #c026d3 45%, #7c3aed 100%)",
                  }}
                >
                  <div className="relative h-[68px] w-[68px] overflow-hidden rounded-[20px] bg-[#1C1C1E]">
                    {thumb ? (
                      <Image
                        src={thumb}
                        alt={handle}
                        fill
                        className="object-cover"
                        sizes="72px"
                        unoptimized
                      />
                    ) : (
                      <div className="h-full w-full bg-zinc-800" />
                    )}
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded px-1 text-[8px] font-black uppercase tracking-wide text-white drop-shadow">
                      Live
                    </span>
                  </div>
                </div>
                <span className="max-w-[72px] truncate text-[10px] font-semibold text-white">
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

      <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-[#1a3a3f] via-[#1C1C1E] to-[#0f0f12]">
        <div className="relative z-10 flex min-h-[140px] flex-col justify-center gap-2 p-4 pr-[42%]">
          <span className="inline-flex w-fit rounded-full bg-teal-900/60 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-200">
            Promo · WELCOME50
          </span>
          <p className="text-sm font-black leading-tight text-white sm:text-base">
            WELCOME OFFER
            <br />
            GET 50% MORE GEMS!
          </p>
          <a
            href={promoUrl}
            target="_blank"
            rel="nofollow noopener"
            className="mt-1 inline-flex w-full max-w-[200px] items-center justify-center rounded-full bg-[#39FF14] px-4 py-2.5 text-xs font-extrabold text-black shadow-[0_0_20px_rgba(57,255,20,0.35)] transition active:scale-[0.98]"
          >
            Claim Bonus Gems
          </a>
        </div>
        {promoImage && (
          <div className="pointer-events-none absolute bottom-0 right-0 top-0 w-[46%]">
            <Image
              src={promoImage}
              alt=""
              fill
              className="object-cover object-top opacity-95"
              sizes="200px"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#1C1C1E]/40 to-[#1C1C1E]" />
          </div>
        )}
      </div>

      <section>
        <div className="mb-2 flex items-center justify-between px-0.5">
          <h2 className="text-xs font-bold text-zinc-300">
            {category ? category.label : "Discover"}
          </h2>
          <span className="text-[10px] font-semibold text-zinc-500">
            {isPending || showSkeleton
              ? "…"
              : `${displayedPerformers.length} / ${total}`}
          </span>
        </div>
        {showSkeleton ? (
          <ExplorePerformerGridSkeleton count={12} columns={3} />
        ) : (
          <ExploreSlushyGrid performers={displayedPerformers} />
        )}
      </section>
    </div>
  );
}
