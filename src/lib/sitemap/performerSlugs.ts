import profileSitemapSlugs from "@/generated/profile-sitemap-slugs.json";
import { filterCanonicalProfileSlugsForSitemap } from "@/lib/sitemap/sitemapUrlPolicy";

/**
 * Canonical profile slugs for sitemaps (build-time manifest; no runtime API).
 */
export async function collectPerformerProfileSlugs(): Promise<string[]> {
  const raw = Array.isArray(profileSitemapSlugs) ? profileSitemapSlugs : [];
  return filterCanonicalProfileSlugsForSitemap(raw);
}
