"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { ExploreCategoryGrid } from "@/components/explore/ExploreCategoryGrid";
import type { ExploreCategory } from "@/lib/crackrevenue/categories";
import { ExploreCategoryTabs } from "@/components/explore/ExploreCategoryTabs";
import { ExplorePerformerGrid } from "@/components/explore/ExplorePerformerGrid";
import { ExplorePerformerGridSkeleton } from "@/components/explore/ExplorePerformerGridSkeleton";
import {
  EXPLORE_CATEGORY_MAP,
  EXPLORE_CATEGORY_SLUGS,
  getDefaultExploreSeo,
  type ExploreCategorySlug,
} from "@/lib/explore/categorySlugs";
import { resolveExploreCategory } from "@/lib/explore/exploreCatalog";
import { explorePathForCategoryParam } from "@/lib/explore/paths";
import { filterPerformersForCategory } from "@/lib/explore/fetchCategoryPerformers";

type CacheEntry = {
  performers: CrackPerformer[];
  total: number;
};

function cacheKey(cat: string | null): string {
  return cat ?? "__all__";
}

type ExploreBrowsePanelProps = {
  initialCat: string | null;
  initialPerformers: CrackPerformer[];
  initialTotal: number;
  masterPool: CrackPerformer[];
  popularCategories: ExploreCategory[];
};

function buildCacheFromPool(pool: CrackPerformer[]): Map<string, CacheEntry> {
  const map = new Map<string, CacheEntry>();
  const all = filterPerformersForCategory(pool, null, 48);
  map.set("__all__", { performers: all.slice(0, 24), total: all.length });

  for (const slug of EXPLORE_CATEGORY_SLUGS) {
    const config = EXPLORE_CATEGORY_MAP[slug];
    const filtered = filterPerformersForCategory(pool, config, 48);
    map.set(slug, {
      performers: filtered.slice(0, 24),
      total: filtered.length,
    });
  }

  return map;
}

export function ExploreBrowsePanel({
  initialCat,
  initialPerformers,
  initialTotal,
  masterPool,
  popularCategories,
}: ExploreBrowsePanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [activeCat, setActiveCat] = useState<string | null>(initialCat);
  const [performers, setPerformers] =
    useState<CrackPerformer[]>(initialPerformers);
  const [total, setTotal] = useState(initialTotal);

  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());

  useEffect(() => {
    const built = buildCacheFromPool(masterPool);
    cacheRef.current = built;
    const key = cacheKey(initialCat);
    const entry = built.get(key);
    if (entry) {
      setPerformers(entry.performers);
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
    setPerformers(entry.performers);
    setTotal(entry.total);
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

  const category = resolveExploreCategory(activeCat);
  const defaults = getDefaultExploreSeo();
  const headline = category?.headline ?? defaults.headline;
  const subline = category
    ? `${category.seoDescription.slice(0, 120)}…`
    : defaults.subline;

  const showSkeleton = loading;
  const label =
    category?.label ??
    (activeCat && activeCat in EXPLORE_CATEGORY_MAP
      ? EXPLORE_CATEGORY_MAP[activeCat as ExploreCategorySlug].label
      : null);

  return (
    <>
      <h1 className="mb-0.5 text-2xl font-black tracking-tight">{headline}</h1>
      <p className="mb-4 text-xs text-zinc-400">{subline}</p>

      <ExploreCategoryTabs
        activeCat={activeCat}
        isPending={isPending || loading}
        onSelectCategory={loadCategory}
      />

      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-wide text-zinc-200">
            {label ? `Results · ${label}` : "Live now"}
          </h2>
          <span className="text-xs font-semibold text-pink-500">
            {showSkeleton ? "…" : total} models
          </span>
        </div>
        {showSkeleton ? (
          <ExplorePerformerGridSkeleton count={8} />
        ) : (
          <ExplorePerformerGrid performers={performers} />
        )}
      </section>

      {!activeCat && !showSkeleton && (
        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wide text-zinc-200">
              Popular categories
            </h2>
            <span className="text-xs font-semibold text-pink-500">
              {popularCategories.length} active
            </span>
          </div>
          <ExploreCategoryGrid categories={popularCategories} />
        </section>
      )}
    </>
  );
}
