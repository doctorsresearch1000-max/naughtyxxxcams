import type { Metadata } from "next";
import { Suspense } from "react";
import { ExplorePageClient } from "@/components/explore/ExplorePageClient";
import { ExplorePerformerGridSkeleton } from "@/components/explore/ExplorePerformerGridSkeleton";
import {
  getDefaultExploreSeo,
  resolveExploreCategory,
} from "@/lib/explore/categorySlugs";

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

export default function ExplorePage() {
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
        <ExplorePageClient />
      </Suspense>
    </main>
  );
}
