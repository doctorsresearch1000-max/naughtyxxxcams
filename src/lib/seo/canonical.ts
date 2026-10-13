import { explorePathForCategoryParam } from "@/lib/explore/paths";
import { sanitizeModelSlug } from "@/lib/seo/modelPermalink";
import { getSiteUrl } from "@/lib/sitemap/siteUrl";

export function profileCanonicalUrl(profileSlug: string): string {
  const slug =
    sanitizeModelSlug(profileSlug) ?? profileSlug.trim().toLowerCase();
  return `${getSiteUrl()}/profile/${encodeURIComponent(slug)}`;
}

/** Canonical for `/explore` and `/explore/{slug}` (validated category only). */
export function exploreCanonicalUrl(catParam?: string | null): string {
  const path = explorePathForCategoryParam(catParam);
  return `${getSiteUrl()}${path}`;
}
