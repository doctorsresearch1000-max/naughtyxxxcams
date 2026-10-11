import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { ExploreMain } from "@/components/explore/ExploreMain";
import { isExploreCatalogSlug, resolveExploreCategory } from "@/lib/explore/exploreCatalog";
import { isExploreCategorySlug } from "@/lib/explore/categorySlugs";
import { explorePathForCategorySlug } from "@/lib/explore/paths";
import { getExploreServerBootstrap } from "@/lib/explore/getExploreServerBootstrap";
import { resolveCategorySlugTarget } from "@/lib/site/categoryMenu";
import { getSiteUrl } from "@/lib/sitemap/siteUrl";
import { generateExploreSeoCopy } from "@/lib/seo/exploreSeoContent";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const normalized = slug.trim().toLowerCase();
  const category = resolveExploreCategory(
    isExploreCatalogSlug(normalized) ? normalized : null,
  );
  if (!category) {
    return { robots: { index: false, follow: false } };
  }
  const copy = generateExploreSeoCopy(category);
  const canonical = `${getSiteUrl()}/category/${normalized}`;
  return {
    title: copy.title,
    description: copy.description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title: copy.title,
      description: copy.description,
      url: canonical,
    },
  };
}

export default async function CategoryHubPage({ params }: PageProps) {
  const { slug } = await params;
  const normalized = slug.trim().toLowerCase();
  if (!normalized) notFound();

  if (isExploreCategorySlug(normalized)) {
    permanentRedirect(explorePathForCategorySlug(normalized));
  }

  if (isExploreCatalogSlug(normalized)) {
    const bootstrap = await getExploreServerBootstrap(normalized);
    return <ExploreMain categorySlug={normalized} bootstrap={bootstrap} />;
  }

  const target = resolveCategorySlugTarget(normalized);
  if (target?.startsWith("/explore?")) {
    notFound();
  }
  if (target && target !== `/category/${normalized}`) {
    permanentRedirect(target);
  }

  notFound();
}
