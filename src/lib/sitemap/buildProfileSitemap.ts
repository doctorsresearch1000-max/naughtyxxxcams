import type { MetadataRoute } from "next";
import { PROFILE_SITEMAP_CHUNK_SIZE } from "@/lib/sitemap/constants";
import { collectPerformerProfileSlugs } from "@/lib/sitemap/performerSlugs";
import {
  filterSitemapEntries,
  profileSitemapAbsoluteUrl,
} from "@/lib/sitemap/sitemapUrlPolicy";

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
  const entries: MetadataRoute.Sitemap = [];
  for (const slug of slugs) {
    const url = profileSitemapAbsoluteUrl(slug);
    if (!url) continue;
    entries.push({
      url,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.75,
    });
  }
  return filterSitemapEntries(entries);
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
