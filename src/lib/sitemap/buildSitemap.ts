import type { MetadataRoute } from "next";
import { buildExploreSitemapEntries } from "@/lib/sitemap/buildExploreSitemap";
import { loadProfileSlugChunks } from "@/lib/sitemap/buildProfileSitemap";
import {
  filterSitemapEntries,
  profileSitemapAbsoluteUrl,
} from "@/lib/sitemap/sitemapUrlPolicy";

/** @deprecated Use sitemap index + explore/profile sub-sitemaps. */
export async function buildSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const explore = buildExploreSitemapEntries(now);
  const chunks = await loadProfileSlugChunks();
  const profiles: MetadataRoute.Sitemap = chunks.flatMap((chunk) =>
    chunk.flatMap((slug) => {
      const url = profileSitemapAbsoluteUrl(slug);
      if (!url) return [];
      return [
        {
          url,
          lastModified: now,
          changeFrequency: "daily" as const,
          priority: 0.75,
        },
      ];
    }),
  );
  return filterSitemapEntries([...explore, ...profiles]);
}
