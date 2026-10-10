import type { CrackPerformer } from "@/lib/crackrevenue/api";
import type { ExploreCategory } from "@/lib/crackrevenue/categories";
import {
  EXPLORE_CATEGORY_MAP,
  type ExploreCategorySlug,
  isExploreCategorySlug,
} from "@/lib/explore/categorySlugs";
import type { ExploreCategoryVisualTheme } from "@/lib/explore/exploreCategoryVisualTheme";
import { themeForCategorySlug } from "@/lib/explore/exploreCategoryVisualTheme";
import { EXPLORE_HUB_CATEGORY_SLUGS } from "@/lib/explore/exploreCategoryHubSlugs";
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
  const hubFallback = buildExploreCategoryHubCards(masterPool);
  if (!categories.length) return hubFallback;

  const countsBySlug = new Map(
    hubFallback.map((c) => [c.slug, c.liveCount]),
  );

  const mapped = categories.map((cat, index) => {
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

  return mapped.length > 0 ? mapped : hubFallback;
}

/** Canonical hub cards — never empty when the master pool is still loading. */
export function resolveExploreCategoryHubCards(
  masterPool: CrackPerformer[],
  popularCategories: ExploreCategory[],
): ExploreCategoryHubCard[] {
  const hub = buildExploreCategoryHubCards(masterPool);
  if (popularCategories.length === 0) return hub;
  const fromApi = hubCardsFromApiCategories(popularCategories, masterPool);
  return fromApi.length > 0 ? fromApi : hub;
}
