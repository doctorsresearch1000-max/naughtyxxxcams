import { getSiteUrl } from "@/lib/sitemap/siteUrl";

/** Public URL of a profile sub-sitemap chunk (pretty `.xml` via rewrites). */
export function profileSitemapPublicUrl(
  chunkIndex: number,
  totalChunks: number,
): string {
  const base = getSiteUrl();
  if (totalChunks <= 1) {
    return `${base}/sitemap-profiles.xml`;
  }
  return `${base}/sitemap-profiles-${chunkIndex}.xml`;
}

export function exploreSitemapPublicUrl(): string {
  return `${getSiteUrl()}/sitemap-explore.xml`;
}

export function sitemapIndexPublicUrl(): string {
  return `${getSiteUrl()}/sitemap.xml`;
}
