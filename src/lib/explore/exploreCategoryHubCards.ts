import type { CrackPerformer } from "@/lib/crackrevenue/api";
import type { ExploreCategory } from "@/lib/crackrevenue/categories";
import {
  EXPLORE_CATEGORY_MAP,
  type ExploreCategorySlug,
  isExploreCategorySlug,
} from "@/lib/explore/categorySlugs";
import type { ExploreCategoryVisualTheme } from "@/lib/explore/exploreCategoryVisualTheme";
import { themeForCategorySlug } from "@/lib/explore/exploreCategoryVisualTheme";
import {
  EXPLORE_HUB_CATEGORY_SLUGS,
  isExploreHubCategorySlug,
} from "@/lib/explore/exploreCategoryHubSlugs";
import { filterPerformersForCategory } from "@/lib/explore/fetchCategoryPerformers";
import {
  explorePathForCategorySlug,
  explorePathFromFeedCategory,
} from "@/lib/explore/paths";

export type ExploreCategoryHubCard = {
  id: string;
  slug: string;
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

/** Six curated hub posters (f8f7c0e). */
export function buildExploreCategoryHubCards(
  masterPool: CrackPerformer[],
): ExploreCategoryHubCard[] {
  return EXPLORE_HUB_CATEGORY_SLUGS.map((slug) => {
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

  const excludedTitle = /goth|trans\b|alt\b/i;

  return categories
    .filter((cat) => {
      const slugGuess =
        cat.filterValue?.replace(/\s+/g, "-").toLowerCase() ?? "";
      if (slugGuess && !isExploreHubCategorySlug(slugGuess)) return false;
      if (excludedTitle.test(cat.title ?? "")) return false;
      return true;
    })
    .map((cat, index) => {
      const slugGuess = cat.filterValue?.replace(/\s+/g, "-").toLowerCase() ?? "";
      const slug = isExploreCategorySlug(slugGuess)
        ? slugGuess
        : slugGuess || cat.id;

      return {
        id: cat.id ?? `cat-${index}`,
        slug,
        title: cat.title?.trim() || "Category",
        href: explorePathFromFeedCategory(cat),
        liveCount:
          cat.liveCount ?? countsBySlug.get(slug as ExploreCategorySlug) ?? 0,
        theme: themeForCategorySlug(slug),
      };
    });
}

/** API mapping with guaranteed hub fallback (fixes empty Popular categories). */
export function resolveExploreCategoryHubCards(
  masterPool: CrackPerformer[],
  popularCategories: ExploreCategory[],
): ExploreCategoryHubCard[] {
  const hub = buildExploreCategoryHubCards(masterPool);
  if (!popularCategories.length) return hub;
  const fromApi = hubCardsFromApiCategories(popularCategories, masterPool);
  return fromApi.length > 0 ? fromApi : hub;
}
