import type { ExploreCategory } from "@/lib/crackrevenue/categories";
import {
  type ExploreCategorySlug,
  isExploreCategorySlug,
} from "@/lib/explore/categorySlugs";

/** Path for a validated explore category slug (`/explore/latinas`). */
export function explorePathForCategorySlug(
  slug: ExploreCategorySlug | string,
): string {
  const normalized = slug.trim().toLowerCase();
  if (!isExploreCategorySlug(normalized)) return "/explore";
  return `/explore/${normalized}`;
}

/** `/explore` hub or `/explore/{slug}` when slug is valid. */
export function explorePathForCategoryParam(
  slug: string | null | undefined,
): string {
  if (!slug?.trim()) return "/explore";
  const normalized = slug.trim().toLowerCase();
  if (!isExploreCategorySlug(normalized)) return "/explore";
  return explorePathForCategorySlug(normalized);
}

/** Map API “popular category” cards to our fixed SEO category routes. */
export function explorePathFromFeedCategory(cat: ExploreCategory): string {
  if (cat.filterType === "ethnicity" && cat.filterValue === "hispanic") {
    return explorePathForCategorySlug("latinas");
  }
  if (cat.filterType === "tag" && cat.filterValue === "milf") {
    return explorePathForCategorySlug("milf");
  }
  if (cat.filterType === "tag" && cat.filterValue === "petite") {
    return explorePathForCategorySlug("petite");
  }
  if (cat.filterType === "tag") {
    const guess = cat.filterValue.replace(/\s+/g, "").toLowerCase();
    if (isExploreCategorySlug(guess)) {
      return explorePathForCategorySlug(guess);
    }
  }
  return "/explore";
}
