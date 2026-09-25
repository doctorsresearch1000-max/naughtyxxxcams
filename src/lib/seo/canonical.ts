import { getSiteUrl } from "@/lib/sitemap/siteUrl";
import { isExploreCategorySlug } from "@/lib/explore/categorySlugs";

export function profileCanonicalUrl(profileSlug: string): string {
  const slug = profileSlug.trim().toLowerCase();
  return `${getSiteUrl()}/profile/${encodeURIComponent(slug)}`;
}

/** Canonical for `/explore` and `/explore?cat={slug}` (validated category only). */
export function exploreCanonicalUrl(catParam?: string | null): string {
  const base = `${getSiteUrl()}/explore`;
  if (!catParam?.trim()) return base;
  const cat = catParam.trim().toLowerCase();
  if (!isExploreCategorySlug(cat)) return base;
  return `${base}?cat=${encodeURIComponent(cat)}`;
}
