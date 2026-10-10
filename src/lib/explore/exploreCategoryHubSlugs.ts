import type { ExploreCategorySlug } from "@/lib/explore/categorySlugs";

/** Categories in Explore “Popular categories” (hub UI only — SEO routes unchanged). */
export const EXPLORE_HUB_CATEGORY_SLUGS = [
  "latinas",
  "verified",
  "milf",
  "petite",
  "cosplay",
  "couples",
] as const satisfies readonly ExploreCategorySlug[];

export type ExploreHubCategorySlug = (typeof EXPLORE_HUB_CATEGORY_SLUGS)[number];

/** Hidden from # Categories chip picker (hub + chips). */
export const EXCLUDED_EXPLORE_CHIP_SLUGS = new Set<string>(["trans", "alt"]);

const HUB_SLUG_SET = new Set<string>(EXPLORE_HUB_CATEGORY_SLUGS);

export function isExploreHubCategorySlug(slug: string): boolean {
  return HUB_SLUG_SET.has(slug.trim().toLowerCase());
}

export function isAllowedExploreChipSlug(slug: string): boolean {
  const n = slug.trim().toLowerCase();
  if (EXCLUDED_EXPLORE_CHIP_SLUGS.has(n)) return false;
  return true;
}
