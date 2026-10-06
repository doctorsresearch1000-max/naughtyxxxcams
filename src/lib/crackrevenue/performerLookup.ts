import type { CrackPerformer } from "@/lib/crackrevenue/api";
import {
  findInPerformerPool,
  lookupKeysForProfileSlug,
  PERFORMER_CATALOG_MAX_PAGES,
  PERFORMER_CATALOG_PAGE_SIZE,
} from "@/lib/crackrevenue/performerCatalog";
import { fetchStreamatePerformers } from "@/lib/crackrevenue/api";

const SLUG_CACHE = new Map<string, { performer: CrackPerformer; at: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

async function scanLivePagesForSlug(slug: string): Promise<CrackPerformer | null> {
  for (let page = 1; page <= PERFORMER_CATALOG_MAX_PAGES; page += 1) {
    const data = await fetchStreamatePerformers({
      live: true,
      size: PERFORMER_CATALOG_PAGE_SIZE,
      page,
    });
    const pool = data.performers ?? [];
    const match = findInPerformerPool(pool, slug);
    if (match) return match;
    if (pool.length < PERFORMER_CATALOG_PAGE_SIZE) break;
  }
  return null;
}

async function scanOfflinePagesForSlug(
  slug: string,
): Promise<CrackPerformer | null> {
  for (let page = 1; page <= PERFORMER_CATALOG_MAX_PAGES; page += 1) {
    const data = await fetchStreamatePerformers({
      live: false,
      size: PERFORMER_CATALOG_PAGE_SIZE,
      page,
    });
    const pool = data.performers ?? [];
    const match = findInPerformerPool(pool, slug);
    if (match) return match;
    if (pool.length < PERFORMER_CATALOG_PAGE_SIZE) break;
  }
  return null;
}

export async function findPerformerByProfileSlug(
  slug: string,
  options?: { fresh?: boolean },
): Promise<CrackPerformer | null> {
  const lookupSlugs = lookupKeysForProfileSlug(slug);
  if (lookupSlugs.length === 0) return null;

  if (options?.fresh) {
    for (const key of lookupSlugs) {
      SLUG_CACHE.delete(key);
    }
  }

  for (const key of lookupSlugs) {
    const cached = SLUG_CACHE.get(key);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
      return cached.performer;
    }
  }

  let match: CrackPerformer | null = null;
  for (const key of lookupSlugs) {
    match = await scanLivePagesForSlug(key);
    if (match) break;
  }

  if (!match) {
    for (const key of lookupSlugs) {
      match = await scanOfflinePagesForSlug(key);
      if (match) break;
    }
  }

  if (match) {
    for (const key of lookupSlugs) {
      SLUG_CACHE.set(key, { performer: match, at: Date.now() });
    }
  }

  return match;
}

// fix typo CrackerPerformer -> CrackPerformer