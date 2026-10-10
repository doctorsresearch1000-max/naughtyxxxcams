import {
  EXPLORE_CATEGORY_SLUGS,
  type ExploreCategorySlug,
} from "@/lib/explore/categorySlugs";

/** All SEO explore categories shown in the Popular categories hub. */
export const EXPLORE_HUB_CATEGORY_SLUGS = [
  ...EXPLORE_CATEGORY_SLUGS,
] as const satisfies readonly ExploreCategorySlug[];

export type ExploreHubCategorySlug = (typeof EXPLORE_HUB_CATEGORY_SLUGS)[number];

const HUB_SLUG_SET = new Set<string>(EXPLORE_HUB_CATEGORY_SLUGS);

export function isExploreHubCategorySlug(slug: string): boolean {
  return HUB_SLUG_SET.has(slug.trim().toLowerCase());
}
