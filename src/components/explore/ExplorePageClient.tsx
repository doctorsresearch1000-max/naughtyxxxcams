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
import type { ExploreCategoryConfig } from "@/lib/explore/categorySlugs";
import { resolveExploreCategory } from "@/lib/explore/exploreCatalog";
import { EXPLORE_DISPLAY_LIMIT } from "@/lib/explore/exploreLimits";
import type { ExploreServerBootstrap } from "@/lib/explore/getExploreServerBootstrap";

function sliceForCategory(
  pool: CrackPerformer[],
  category: ExploreCategoryConfig | null,
) {
  const filtered = filterPerformersForCategory(pool, category, pool.length);
  return {
    performers: filtered.slice(0, EXPLORE_DISPLAY_LIMIT),
    total: filtered.length,
  };
}

function initialFromServer(
  bootstrap: ExploreServerBootstrap | null | undefined,
  category: ExploreCategoryConfig | null,
) {
  if (bootstrap?.masterPool?.length) {
    const { performers, total } = sliceForCategory(
      bootstrap.masterPool,
      category,
    );
    return {
      masterPool: bootstrap.masterPool,
      popularCategories: bootstrap.popularCategories,
      performers: bootstrap.performers.length ? bootstrap.performers : performers,
      total: bootstrap.performers.length ? bootstrap.total : total,
      ready: true,
    };
  }

  const cached = readExploreBootstrapCache();
  if (cached?.masterPool.length) {
    const { performers, total } = sliceForCategory(
      cached.masterPool,
      category,
    );
    return {
      masterPool: cached.masterPool,
      popularCategories: cached.popularCategories,
      performers,
      total,
      ready: true,
    };
  }

  return {
    masterPool: [] as CrackPerformer[],
    popularCategories: [] as ExploreCategory[],
    performers: [] as CrackPerformer[],
    total: 0,
    ready: false,
  };
}

type ExplorePageClientProps = {
  categorySlug: string | null;
  bootstrap?: ExploreServerBootstrap | null;
  hidePerformerGrid?: boolean;
};

export function ExplorePageClient({
  categorySlug,
  bootstrap = null,
  hidePerformerGrid = false,
}: ExplorePageClientProps) {
  const category = resolveExploreCategory(categorySlug);
  const initialCat = category?.slug ?? null;

  const [boot] = useState(() => initialFromServer(bootstrap, category));
  const [masterPool, setMasterPool] = useState<CrackPerformer[]>(boot.masterPool);
  const [popularCategories, setPopularCategories] = useState<ExploreCategory[]>(
    boot.popularCategories,
  );
  const [ready, setReady] = useState(boot.ready);

  useEffect(() => {
    if (boot.ready && masterPool.length > 0) return;
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
  }, [boot.ready, masterPool.length]);

  const { performers, total } = sliceForCategory(masterPool, category);

  return (
    <ExploreSlushyDiscover
      key={initialCat ?? "all"}
      initialCat={initialCat}
      initialPerformers={boot.ready ? boot.performers : performers}
      initialTotal={boot.ready ? boot.total : total}
      masterPool={masterPool}
      popularCategories={popularCategories}
      poolLoading={!ready && masterPool.length === 0}
      hidePerformerGrid={hidePerformerGrid}
    />
  );
}
