import { exploreSitemapPublicUrl, profileSitemapPublicUrl } from "@/lib/sitemap/profileSitemapPaths";
import { getProfileSitemapChunkCount } from "@/lib/sitemap/buildProfileSitemap";

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

  return [
    { loc: exploreSitemapPublicUrl(), lastmod: now },
    ...profileMaps,
  ];
}
