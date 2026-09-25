import type { Metadata } from "next";
import { ExplorePageClient } from "@/components/explore/ExplorePageClient";
import { resolveExploreCategory } from "@/lib/explore/categorySlugs";
import { exploreCanonicalUrl } from "@/lib/seo/canonical";
import { generateExploreSeoCopy } from "@/lib/seo/exploreSeoContent";

type ExplorePageProps = {
  searchParams: Promise<{ cat?: string }>;
};

export async function generateMetadata({
  searchParams,
}: ExplorePageProps): Promise<Metadata> {
  const { cat } = await searchParams;
  const category = resolveExploreCategory(cat);
  const canonical = exploreCanonicalUrl(cat);
  const copy = generateExploreSeoCopy(category);

  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: copy.title,
      description: copy.description,
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
