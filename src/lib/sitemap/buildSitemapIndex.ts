import { exploreSitemapPublicUrl, profileSitemapPublicUrl } from "@/lib/sitemap/profileSitemapPaths";
import { getProfileSitemapChunkCount } from "@/lib/sitemap/buildProfileSitemap";
import { filterSitemapIndexLocs } from "@/lib/sitemap/sitemapUrlPolicy";
import { getSiteUrl } from "@/lib/sitemap/siteUrl";

export type SitemapIndexEntry = {
  loc: string;
  lastmod?: Date;
};

export async function buildSitemapIndexEntries(
  now = new Date(),
): Promise<SitemapIndexEntry[]> {
  const chunkCount = await getProfileSitemapChunkCount();
  const safeCount = Math.max(1, chunkCount);

  const profileMaps: SitemapIndexEntry[] = Array.from(
    { length: safeCount },
    (_, i) => ({
      loc: profileSitemapPublicUrl(i, safeCount),
      lastmod: now,
    }),
  );

  const entries = [
    { loc: exploreSitemapPublicUrl(), lastmod: now },
    ...profileMaps,
  ];

  return filterSitemapIndexLocs(entries).map((entry) => {
    const origin = getSiteUrl();
    if (!entry.loc.startsWith(origin)) {
      return { ...entry, loc: entry.loc.replace(/^https?:\/\/[^/]+/i, origin) };
    }
    return entry;
  });
}
