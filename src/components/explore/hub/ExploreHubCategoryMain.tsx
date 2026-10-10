import { ExploreSeoCrawlBlock } from "@/components/explore/ExploreSeoCrawlBlock";
import { ExploreHubCategoryClient } from "@/components/explore/hub/ExploreHubCategoryClient";
import { ExploreHubCategoryHero } from "@/components/explore/hub/ExploreHubCategoryHero";
import { ExploreHubRelatedCategories } from "@/components/explore/hub/ExploreHubRelatedCategories";
import type { ExploreHubCategorySlug } from "@/lib/explore/exploreCategoryHubSlugs";
import { resolveExploreCategory } from "@/lib/explore/exploreCatalog";
import type { ExploreServerBootstrap } from "@/lib/explore/getExploreServerBootstrap";
import { generateExploreSeoCopy } from "@/lib/seo/exploreSeoContent";

const HUB_MAIN_CLASS =
  "mx-auto min-h-screen w-full max-w-md overflow-x-hidden overflow-y-auto bg-[#0d0d0f] px-3.5 pb-24 pt-3 text-white [-webkit-overflow-scrolling:touch] lg:max-w-[1200px] lg:px-6 lg:pb-12 lg:pt-4";

type ExploreHubCategoryMainProps = {
  categorySlug: ExploreHubCategorySlug;
  bootstrap: ExploreServerBootstrap | null;
};

/** Dedicated landing for each popular niche (not the in-page explore filter). */
export function ExploreHubCategoryMain({
  categorySlug,
  bootstrap,
}: ExploreHubCategoryMainProps) {
  const category = resolveExploreCategory(categorySlug);
  if (!category) return null;

  const seo = generateExploreSeoCopy(category);
  const liveCount = bootstrap?.total ?? bootstrap?.performers?.length ?? 0;

  return (
    <main className={HUB_MAIN_CLASS}>
      <ExploreSeoCrawlBlock
        categorySlug={categorySlug}
        bootstrap={bootstrap}
      />

      <ExploreHubCategoryHero
        category={category}
        seo={seo}
        liveCount={liveCount}
      />

      <ExploreHubRelatedCategories currentSlug={categorySlug} />

      <ExploreHubCategoryClient
        categorySlug={categorySlug}
        bootstrap={bootstrap}
      />
    </main>
  );
}
