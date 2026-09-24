export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import type { Metadata } from "next";
import { Suspense } from "react";
import CrackWidget from "@/components/cams/CrackWidget";
import { ExploreCategoryGrid } from "@/components/explore/ExploreCategoryGrid";
import { ExploreCategoryTabs } from "@/components/explore/ExploreCategoryTabs";
import { ExplorePerformerGrid } from "@/components/explore/ExplorePerformerGrid";
import {
  getDefaultExploreSeo,
  resolveExploreCategory,
} from "@/lib/explore/categorySlugs";
import { fetchCategoryPerformers } from "@/lib/explore/fetchCategoryPerformers";
import {
  dedupeCategories,
  fetchAllExploreCategories,
} from "@/lib/crackrevenue/categories";

type ExplorePageProps = {
  searchParams: Promise<{ cat?: string }>;
};

export async function generateMetadata({
  searchParams,
}: ExplorePageProps): Promise<Metadata> {
  const { cat } = await searchParams;
  const category = resolveExploreCategory(cat);
  const defaults = getDefaultExploreSeo();

  if (!category) {
    return {
      title: defaults.title,
      description: defaults.description,
    };
  }

  return {
    title: category.seoTitle,
    description: category.seoDescription,
    openGraph: {
      title: category.seoTitle,
      description: category.seoDescription,
    },
  };
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const { cat } = await searchParams;
  const category = resolveExploreCategory(cat);
  const defaults = getDefaultExploreSeo();

  let uniqueCategories: Awaited<ReturnType<typeof fetchAllExploreCategories>> =
    [];

  try {
    const categories = await fetchAllExploreCategories();
    uniqueCategories = dedupeCategories(categories);
  } catch {
    uniqueCategories = [];
  }

  const { performers, total } = await fetchCategoryPerformers(category, {
    size: 24,
  });

  const headline = category?.headline ?? defaults.headline;
  const subline = category
    ? category.seoDescription.slice(0, 120) + "…"
    : defaults.subline;

  return (
    <main className="mx-auto min-h-screen w-full max-w-md overflow-y-auto bg-black px-4 pb-8 pt-4 text-white [-webkit-overflow-scrolling:touch]">
      <span className="text-[10px] font-black uppercase tracking-widest text-pink-500">
        EXPLORA
      </span>
      <h1 className="mb-0.5 text-2xl font-black tracking-tight">{headline}</h1>
      <p className="mb-4 text-xs text-zinc-400">{subline}</p>

      <Suspense fallback={null}>
        <ExploreCategoryTabs />
      </Suspense>

      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-wide text-zinc-200">
            {category ? `Resultados · ${category.label}` : "En vivo ahora"}
          </h2>
          <span className="text-xs font-semibold text-pink-500">
            {total} modelos
          </span>
        </div>
        <ExplorePerformerGrid performers={performers} />
      </section>

      {!category && (
        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wide text-zinc-200">
              Categorías Populares
            </h2>
            <span className="text-xs font-semibold text-pink-500">
              {uniqueCategories.length} activas
            </span>
          </div>
          <ExploreCategoryGrid categories={uniqueCategories} />
        </section>
      )}

      <section className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-pink-500">
              TENDENCIAS
            </span>
            <h2 className="text-lg font-black">Top Transmisiones</h2>
          </div>
          <span className="text-xs font-semibold text-pink-400">
            Streamate en vivo
          </span>
        </div>

        <div className="relative isolate overflow-hidden rounded-2xl">
          <CrackWidget
            cols={2}
            rows={4}
            number={8}
            ratio={0.75}
            useFeed={0}
            animateFeed={0}
            height="min-h-[500px]"
            embedInstanceId={
              category ? `explore-${category.slug}` : "explore-grid"
            }
          />
        </div>
      </section>
    </main>
  );
}
