import type { ExploreCategorySlug } from "@/lib/explore/categorySlugs";

/** Categories shown in Explore “Popular categories” (hub UI only — SEO routes unchanged). */
export const EXPLORE_HUB_CATEGORY_SLUGS: ExploreCategorySlug[] = [
  "latinas",
  "verified",
  "milf",
  "petite",
  "cosplay",
  "couples",
];

const HUB_SLUG_SET = new Set<string>(EXPLORE_HUB_CATEGORY_SLUGS);

export function isExploreHubCategorySlug(slug: string): boolean {
  return HUB_SLUG_SET.has(slug.trim().toLowerCase());
}

export function filterHubCategorySlug(slug: string): boolean {
  const n = slug.trim().toLowerCase();
  if (!isExploreHubCategorySlug(n)) return false;
  if (n === "trans" || n === "alt") return false;
  return true;
}
