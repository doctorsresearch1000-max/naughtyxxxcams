import type { CrackPerformer } from "@/lib/crackrevenue/api";
import type { ExploreCategory } from "@/lib/crackrevenue/categories";
import {
  EXPLORE_CATEGORY_MAP,
  EXPLORE_CATEGORY_SLUGS,
  type ExploreCategorySlug,
  isExploreCategorySlug,
} from "@/lib/explore/categorySlugs";
import type { ExploreCategoryVisualTheme } from "@/lib/explore/exploreCategoryVisualTheme";
import { themeForCategorySlug } from "@/lib/explore/exploreCategoryVisualTheme";
import { filterPerformersForCategory } from "@/lib/explore/fetchCategoryPerformers";
import {
  explorePathForCategorySlug,
  explorePathFromFeedCategory,
} from "@/lib/explore/paths";

export type ExploreCategoryHubCard = {
  id: string;
  slug: string;
  /** Primary poster title (typography hero) */
  title: string;
  href: string;
  liveCount: number;
  theme: ExploreCategoryVisualTheme;
};

function cardFromSlug(
  slug: ExploreCategorySlug,
  liveCount: number,
): ExploreCategoryHubCard {
  const config = EXPLORE_CATEGORY_MAP[slug];
  return {
    id: slug,
    slug,
    title: config.label,
    href: explorePathForCategorySlug(slug),
    liveCount,
    theme: themeForCategorySlug(slug),
  };
}

/** Editorial category posters — counts from pool, no model/ad imagery. */
export function buildExploreCategoryHubCards(
  masterPool: CrackPerformer[],
): ExploreCategoryHubCard[] {
  return EXPLORE_CATEGORY_SLUGS.map((slug) => {
    const config = EXPLORE_CATEGORY_MAP[slug];
    const filtered = filterPerformersForCategory(
      masterPool,
      config,
      masterPool.length,
    );
    const liveCount = filtered.filter((p) => p.live !== false).length;
    return cardFromSlug(slug, liveCount);
  });
}

export function hubCardsFromApiCategories(
  categories: ExploreCategory[],
  masterPool: CrackPerformer[],
): ExploreCategoryHubCard[] {
  const countsBySlug = new Map(
    buildExploreCategoryHubCards(masterPool).map((c) => [c.slug, c.liveCount]),
  );

  return categories.map((cat, index) => {
    const slugGuess = cat.filterValue?.replace(/\s+/g, "-").toLowerCase() ?? "";
    const slug = isExploreCategorySlug(slugGuess) ? slugGuess : slugGuess || cat.id;

    return {
      id: cat.id ?? `cat-${index}`,
      slug,
      title: cat.title?.trim() || "Category",
      href: explorePathFromFeedCategory(cat),
      liveCount: cat.liveCount ?? countsBySlug.get(slug as ExploreCategorySlug) ?? 0,
      theme: themeForCategorySlug(slug),
    };
  });
}
