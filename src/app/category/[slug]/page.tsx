import { notFound, redirect } from "next/navigation";
import { ExploreMain } from "@/components/explore/ExploreMain";
import {
  isExploreCatalogSlug,
} from "@/lib/explore/exploreCatalog";
import { isExploreCategorySlug } from "@/lib/explore/categorySlugs";
import { explorePathForCategorySlug } from "@/lib/explore/paths";
import { getExploreServerBootstrap } from "@/lib/explore/getExploreServerBootstrap";
import { resolveCategorySlugTarget } from "@/lib/site/categoryMenu";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CategoryHubPage({ params }: PageProps) {
  const { slug } = await params;
  const normalized = slug.trim().toLowerCase();
  if (!normalized) notFound();

  if (isExploreCategorySlug(normalized)) {
    redirect(explorePathForCategorySlug(normalized));
  }

  if (isExploreCatalogSlug(normalized)) {
    const bootstrap = await getExploreServerBootstrap(normalized);
    return <ExploreMain categorySlug={normalized} bootstrap={bootstrap} />;
  }

  const target = resolveCategorySlugTarget(normalized);
  if (target?.startsWith("/explore?")) {
    redirect(target);
  }
  if (target && target !== `/category/${normalized}`) {
    redirect(target);
  }

  notFound();
}
