import type { Metadata } from "next";
import { permanentRedirect, redirect } from "next/navigation";
import { ExploreMain } from "@/components/explore/ExploreMain";
import { isExploreCategorySlug } from "@/lib/explore/categorySlugs";
import { isExploreCatalogSlug } from "@/lib/explore/exploreCatalog";
import { explorePathForCategorySlug } from "@/lib/explore/paths";
import { exploreCanonicalUrl } from "@/lib/seo/canonical";
import { generateExploreSeoCopy } from "@/lib/seo/exploreSeoContent";

const LEGACY_SHOW_REDIRECTS: Record<string, string> = {
  private: "/explore/verified",
  lovense: "/explore/petite",
  vip: "/explore/cosplay",
  asmr: "/explore/alt",
  gaming: "/explore/alt",
  debut: "/explore/verified",
};

type ExplorePageProps = {
  searchParams: Promise<{ cat?: string; show?: string; filter?: string }>;
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
  const { cat, show, filter } = await searchParams;

  const showKey = show?.trim().toLowerCase();
  if (showKey && LEGACY_SHOW_REDIRECTS[showKey]) {
    permanentRedirect(LEGACY_SHOW_REDIRECTS[showKey]);
  }
  if (filter?.trim().toLowerCase() === "free") {
    permanentRedirect("/explore");
  }

  if (cat?.trim() && isExploreCategorySlug(cat)) {
    redirect(explorePathForCategorySlug(cat));
  }

  const catalogCat = cat?.trim().toLowerCase();
  if (catalogCat && isExploreCatalogSlug(catalogCat)) {
    return <ExploreMain categorySlug={catalogCat} />;
  }

  return <ExploreMain categorySlug={null} />;
}
