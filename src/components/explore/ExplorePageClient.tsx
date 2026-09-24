"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { CrackPerformer } from "@/lib/crackrevenue/api";
import type { ExploreCategory } from "@/lib/crackrevenue/categories";
import { ExploreSlushyDiscover } from "@/components/explore/ExploreSlushyDiscover";
import { ExplorePerformerGridSkeleton } from "@/components/explore/ExplorePerformerGridSkeleton";
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

export function ExplorePageClient() {
  const searchParams = useSearchParams();
  const catParam = searchParams.get("cat");
  const category = resolveExploreCategory(catParam);
  const initialCat = category?.slug ?? null;

  const [masterPool, setMasterPool] = useState<CrackPerformer[]>([]);
  const [popularCategories, setPopularCategories] = useState<ExploreCategory[]>(
    [],
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/explore/bootstrap", {
          cache: "no-store",
        });
        const json = (await res.json()) as {
          masterPool?: CrackPerformer[];
          popularCategories?: ExploreCategory[];
        };
        if (cancelled) return;
        setMasterPool(
          Array.isArray(json.masterPool) ? json.masterPool : [],
        );
        setPopularCategories(
          Array.isArray(json.popularCategories) ? json.popularCategories : [],
        );
      } catch {
        if (!cancelled) {
          setMasterPool([]);
          setPopularCategories([]);
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const { performers, total } = sliceForCategory(masterPool, category);

  if (!ready) {
    return (
      <>
        <div className="mb-4 h-11 w-full animate-pulse rounded-full bg-[#1C1C1E]" />
        <ExplorePerformerGridSkeleton count={12} columns={3} />
      </>
    );
  }

  return (
    <ExploreSlushyDiscover
      key={initialCat ?? "all"}
      initialCat={initialCat}
      initialPerformers={performers}
      initialTotal={total}
      masterPool={masterPool}
      popularCategories={popularCategories}
    />
  );
}
