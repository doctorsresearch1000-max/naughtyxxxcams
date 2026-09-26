import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ExploreMain } from "@/components/explore/ExploreMain";
import { isExploreCategorySlug } from "@/lib/explore/categorySlugs";
import { isExploreCatalogSlug } from "@/lib/explore/exploreCatalog";
import { explorePathForCategorySlug } from "@/lib/explore/paths";
import { exploreCanonicalUrl } from "@/lib/seo/canonical";
import { generateExploreSeoCopy } from "@/lib/seo/exploreSeoContent";

type ExplorePageProps = {
  searchParams: Promise<{ cat?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const canonical = exploreCanonicalUrl(null);
  const copy = generateExploreSeoCopy(null);

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

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const { cat } = await searchParams;
  if (cat?.trim() && isExploreCategorySlug(cat)) {
    redirect(explorePathForCategorySlug(cat));
  }

  const catalogCat = cat?.trim().toLowerCase();
  if (catalogCat && isExploreCatalogSlug(catalogCat)) {
    return <ExploreMain categorySlug={catalogCat} />;
  }

  return <ExploreMain categorySlug={null} />;
}
