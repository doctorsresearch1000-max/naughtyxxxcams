import type { Metadata } from "next";
import { ExplorePageClient } from "@/components/explore/ExplorePageClient";
import {
  getDefaultExploreSeo,
  resolveExploreCategory,
} from "@/lib/explore/categorySlugs";
import { exploreCanonicalUrl } from "@/lib/seo/canonical";

type ExplorePageProps = {
  searchParams: Promise<{ cat?: string }>;
};

export async function generateMetadata({
  searchParams,
}: ExplorePageProps): Promise<Metadata> {
  const { cat } = await searchParams;
  const category = resolveExploreCategory(cat);
  const defaults = getDefaultExploreSeo();
  const canonical = exploreCanonicalUrl(cat);

  if (!category) {
    return {
      title: defaults.title,
      description: defaults.description,
      alternates: {
        canonical,
      },
      openGraph: {
        title: defaults.title,
        description: defaults.description,
        url: canonical,
      },
    };
  }

  return {
    title: category.seoTitle,
    description: category.seoDescription,
    alternates: {
      canonical,
    },
    openGraph: {
      title: category.seoTitle,
      description: category.seoDescription,
      url: canonical,
    },
  };
}

export default function ExplorePage() {
  return (
    <main
      className="mx-auto min-h-screen w-full max-w-md overflow-y-auto bg-[#0A0A0A] px-3 pb-24 pt-2 text-white [-webkit-overflow-scrolling:touch]"
    >
      <ExplorePageClient />
    </main>
  );
}
