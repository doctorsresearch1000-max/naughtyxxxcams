import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExploreMain } from "@/components/explore/ExploreMain";
import {
  EXPLORE_CATEGORY_SLUGS,
  isExploreCategorySlug,
  resolveExploreCategory,
} from "@/lib/explore/categorySlugs";
import { exploreCanonicalUrl } from "@/lib/seo/canonical";
import { generateExploreSeoCopy } from "@/lib/seo/exploreSeoContent";

type ExploreCategoryPageProps = {
  params: Promise<{ category: string }>;
};

export function generateStaticParams() {
  return EXPLORE_CATEGORY_SLUGS.map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: ExploreCategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  if (!isExploreCategorySlug(category)) {
    return {};
  }
  const config = resolveExploreCategory(category);
  const canonical = exploreCanonicalUrl(category);
  const copy = generateExploreSeoCopy(config);

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

export default async function ExploreCategoryPage({
  params,
}: ExploreCategoryPageProps) {
  const { category } = await params;
  if (!isExploreCategorySlug(category)) {
    notFound();
  }

  return <ExploreMain categorySlug={category} />;
}
