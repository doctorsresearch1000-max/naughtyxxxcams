import type { MetadataRoute } from "next";
import { PROFILE_SITEMAP_CHUNK_SIZE } from "@/lib/sitemap/constants";
import { collectPerformerProfileSlugs } from "@/lib/sitemap/performerSlugs";
import { getSiteUrl } from "@/lib/sitemap/siteUrl";

export function chunkProfileSlugs(slugs: string[]): string[][] {
  if (slugs.length === 0) return [[]];
  const chunks: string[][] = [];
  for (let i = 0; i < slugs.length; i += PROFILE_SITEMAP_CHUNK_SIZE) {
    chunks.push(slugs.slice(i, i + PROFILE_SITEMAP_CHUNK_SIZE));
  }
  return chunks;
}

function slugsToSitemapEntries(
  slugs: string[],
  now: Date,
): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  return slugs.map((slug) => ({
    url: `${baseUrl}/profile/${encodeURIComponent(slug)}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.75,
  }));
}

export async function loadProfileSlugChunks(): Promise<string[][]> {
  try {
    const slugs = await collectPerformerProfileSlugs();
    return chunkProfileSlugs(slugs);
  } catch {
    return [[]];
  }
}

export async function getProfileSitemapChunkCount(): Promise<number> {
  const chunks = await loadProfileSlugChunks();
  return Math.max(1, chunks.length);
}

export async function buildProfileSitemapChunkEntries(
  chunkIndex: number,
  now = new Date(),
): Promise<MetadataRoute.Sitemap> {
  const chunks = await loadProfileSlugChunks();
  const index = Math.max(0, Math.floor(chunkIndex));
  if (index >= chunks.length) return [];
  return slugsToSitemapEntries(chunks[index] ?? [], now);
}
