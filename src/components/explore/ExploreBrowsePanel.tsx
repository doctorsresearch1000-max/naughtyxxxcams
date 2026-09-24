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
  getDefaultExploreSeo,
  resolveExploreCategory,
  type ExploreCategorySlug,
} from "@/lib/explore/categorySlugs";

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
  popularCategories: ExploreCategory[];
};

export function ExploreBrowsePanel({
  initialCat,
  initialPerformers,
  initialTotal,
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
    cacheRef.current.set(cacheKey(initialCat), {
      performers: initialPerformers,
      total: initialTotal,
    });
  }, [initialCat, initialPerformers, initialTotal]);

  const applyEntry = useCallback((cat: string | null, entry: CacheEntry) => {
    setActiveCat(cat);
    setPerformers(entry.performers);
    setTotal(entry.total);
  }, []);

  const loadCategory = useCallback(
    async (slug: string | null, options?: { syncUrl?: boolean }) => {
      const key = cacheKey(slug);
      const cached = cacheRef.current.get(key);

      if (cached) {
        startTransition(() => {
          applyEntry(slug, cached);
          if (options?.syncUrl !== false) {
            const href = slug ? `/explore?cat=${slug}` : "/explore";
            router.replace(href, { scroll: false });
          }
        });
        return;
      }

      setLoading(true);
      try {
        const qs = slug ? `?cat=${encodeURIComponent(slug)}` : "";
        const res = await fetch(`/api/explore/category${qs}`);
        const json = (await res.json()) as CacheEntry & { cat?: string | null };
        const entry: CacheEntry = {
          performers: json.performers ?? [],
          total: json.total ?? 0,
        };
        cacheRef.current.set(key, entry);

        startTransition(() => {
          applyEntry(slug, entry);
          if (options?.syncUrl !== false) {
            const href = slug ? `/explore?cat=${slug}` : "/explore";
            router.replace(href, { scroll: false });
          }
        });
      } catch {
        startTransition(() => {
          applyEntry(slug, { performers: [], total: 0 });
        });
      } finally {
        setLoading(false);
      }
    },
    [applyEntry, router],
  );

  const handleSelectCategory = useCallback(
    (slug: string | null) => {
      void loadCategory(slug);
    },
    [loadCategory],
  );

  const category = resolveExploreCategory(activeCat);
  const defaults = getDefaultExploreSeo();
  const headline = category?.headline ?? defaults.headline;
  const subline = category
    ? `${category.seoDescription.slice(0, 120)}…`
    : defaults.subline;

  const showSkeleton = loading || isPending;
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
        onSelectCategory={handleSelectCategory}
      />

      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-wide text-zinc-200">
            {label ? `Resultados · ${label}` : "En vivo ahora"}
          </h2>
          <span className="text-xs font-semibold text-pink-500">
            {showSkeleton ? "…" : total} modelos
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
              Categorías Populares
            </h2>
            <span className="text-xs font-semibold text-pink-500">
              {popularCategories.length} activas
            </span>
          </div>
          <ExploreCategoryGrid categories={popularCategories} />
        </section>
      )}
    </>
  );
}
