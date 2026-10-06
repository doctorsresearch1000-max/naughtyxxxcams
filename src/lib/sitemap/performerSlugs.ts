import profileSitemapSlugs from "@/generated/profile-sitemap-slugs.json";

/**
 * Canonical profile slugs for sitemaps (build-time manifest; no runtime API).
 */
export async function collectPerformerProfileSlugs(): Promise<string[]> {
  return Array.isArray(profileSitemapSlugs) ? profileSitemapSlugs : [];
}
