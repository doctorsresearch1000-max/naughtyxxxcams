export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import type { Metadata } from "next";
import { Suspense } from "react";
import { ExploreSlushyDiscover } from "@/components/explore/ExploreSlushyDiscover";
import { ExplorePerformerGridSkeleton } from "@/components/explore/ExplorePerformerGridSkeleton";
import {
  getDefaultExploreSeo,
  resolveExploreCategory,
} from "@/lib/explore/categorySlugs";
import {
  fetchCategoryPerformers,
  fetchExploreMasterPool,
} from "@/lib/explore/fetchCategoryPerformers";
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
  const initialCat = category?.slug ?? null;

  let uniqueCategories: Awaited<ReturnType<typeof fetchAllExploreCategories>> =
    [];

  try {
    const categories = await fetchAllExploreCategories();
    uniqueCategories = dedupeCategories(categories);
  } catch {
    uniqueCategories = [];
  }

  let masterPool: Awaited<ReturnType<typeof fetchExploreMasterPool>> = [];
  try {
    masterPool = await fetchExploreMasterPool(2);
  } catch {
    masterPool = [];
  }

  let performers: Awaited<
    ReturnType<typeof fetchCategoryPerformers>
  >["performers"] = [];
  let total = 0;
  try {
    const result = await fetchCategoryPerformers(category, {
      size: 48,
      masterPool,
    });
    performers = result.performers;
    total = result.total;
  } catch {
    performers = [];
    total = 0;
  }

  return (
    <main
      className="mx-auto min-h-screen w-full max-w-md overflow-y-auto bg-[#0A0A0A] px-3 pb-24 pt-2 text-white [-webkit-overflow-scrolling:touch]"
    >
      <Suspense
        fallback={
          <>
            <div className="mb-4 h-11 w-full animate-pulse rounded-full bg-[#1C1C1E]" />
            <ExplorePerformerGridSkeleton count={12} columns={3} />
          </>
        }
      >
        <ExploreSlushyDiscover
          initialCat={initialCat}
          initialPerformers={performers}
          initialTotal={total}
          masterPool={masterPool}
          popularCategories={uniqueCategories}
        />
      </Suspense>
    </main>
  );
}
