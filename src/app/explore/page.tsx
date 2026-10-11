import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { ExploreMain } from "@/components/explore/ExploreMain";
import { isExploreCategorySlug } from "@/lib/explore/categorySlugs";
import { isExploreCatalogSlug } from "@/lib/explore/exploreCatalog";
import { explorePathForCategorySlug } from "@/lib/explore/paths";
import { exploreCanonicalUrl } from "@/lib/seo/canonical";
import { getExploreServerBootstrap } from "@/lib/explore/getExploreServerBootstrap";
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

export async function generateMetadata({
  searchParams,
}: ExplorePageProps): Promise<Metadata> {
  const { cat } = await searchParams;
  const canonical = exploreCanonicalUrl(null);
  const copy = generateExploreSeoCopy(null);

  const catKey = cat?.trim().toLowerCase();
  const hasJunkQuery =
    Boolean(catKey) &&
    !isExploreCategorySlug(catKey!) &&
    !isExploreCatalogSlug(catKey!);

  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical,
    },
    robots: hasJunkQuery
      ? { index: false, follow: true, googleBot: { index: false, follow: true } }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
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

  const catalogCat = cat?.trim().toLowerCase();
  if (catalogCat) {
    if (isExploreCategorySlug(catalogCat)) {
      permanentRedirect(explorePathForCategorySlug(catalogCat));
    }
    if (isExploreCatalogSlug(catalogCat)) {
      permanentRedirect(`/category/${catalogCat}`);
    }
    permanentRedirect("/explore");
  }

  const bootstrap = await getExploreServerBootstrap(null);
  return <ExploreMain categorySlug={null} bootstrap={bootstrap} />;
}
