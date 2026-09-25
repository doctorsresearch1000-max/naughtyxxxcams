import type { MetadataRoute } from "next";
import { buildExploreSitemapEntries } from "@/lib/sitemap/buildExploreSitemap";
import { loadProfileSlugChunks } from "@/lib/sitemap/buildProfileSitemap";
import { getSiteUrl } from "@/lib/sitemap/siteUrl";

/** @deprecated Use sitemap index + explore/profile sub-sitemaps. */
export async function buildSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const explore = buildExploreSitemapEntries(now);
  const baseUrl = getSiteUrl();
  const chunks = await loadProfileSlugChunks();
  const profiles: MetadataRoute.Sitemap = chunks.flatMap((chunk) =>
    chunk.map((slug) => ({
      url: `${baseUrl}/profile/${encodeURIComponent(slug)}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.75,
    })),
  );
  return [...explore, ...profiles];
}
