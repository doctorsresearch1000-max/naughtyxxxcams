"use client";

import { useEffect, useState } from "react";
import type { CrackPerformer } from "@/lib/crackrevenue/api";
import type { ExploreCategory } from "@/lib/crackrevenue/categories";
import { ExploreSlushyDiscover } from "@/components/explore/ExploreSlushyDiscover";
import {
  fetchExploreBootstrap,
  readExploreBootstrapCache,
} from "@/lib/explore/exploreClientCache";
import { filterPerformersForCategory } from "@/lib/explore/fetchCategoryPerformers";
import {
  resolveExploreCategory,
  type ExploreCategoryConfig,
} from "@/lib/explore/categorySlugs";

const DISPLAY_LIMIT = 48;

function sliceForCategory(
  pool: CrackPerformer[],
  category: ExploreCategoryConfig | null,
) {
  const filtered = filterPerformersForCategory(pool, category, pool.length);
  return {
    performers: filtered.slice(0, DISPLAY_LIMIT),
    total: filtered.length,
  };
}

function initialFromCache(): {
  masterPool: CrackPerformer[];
  popularCategories: ExploreCategory[];
  ready: boolean;
} {
  const cached = readExploreBootstrapCache();
  if (cached?.masterPool.length) {
    return {
      masterPool: cached.masterPool,
      popularCategories: cached.popularCategories,
      ready: true,
    };
  }
  return { masterPool: [], popularCategories: [], ready: false };
}

type ExplorePageClientProps = {
  categorySlug: string | null;
};

export function ExplorePageClient({ categorySlug }: ExplorePageClientProps) {
  const category = resolveExploreCategory(categorySlug);
  const initialCat = category?.slug ?? null;

  const [boot] = useState(initialFromCache);
  const [masterPool, setMasterPool] = useState<CrackPerformer[]>(boot.masterPool);
  const [popularCategories, setPopularCategories] = useState<ExploreCategory[]>(
    boot.popularCategories,
  );
  const [ready, setReady] = useState(boot.ready);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const payload = await fetchExploreBootstrap();
        if (cancelled) return;
        setMasterPool(payload.masterPool);
        setPopularCategories(payload.popularCategories);
        setReady(true);
      } catch {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const { performers, total } = sliceForCategory(masterPool, category);

  return (
    <ExploreSlushyDiscover
      key={initialCat ?? "all"}
      initialCat={initialCat}
      initialPerformers={performers}
      initialTotal={total}
      masterPool={masterPool}
      popularCategories={popularCategories}
      poolLoading={!ready && masterPool.length === 0}
    />
  );
}
