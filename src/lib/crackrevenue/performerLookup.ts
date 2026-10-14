import type { CrackPerformer } from "@/lib/crackrevenue/api";
import {
  findInPerformerPool,
  lookupKeysForProfileSlug,
  PERFORMER_CATALOG_PAGE_SIZE,
} from "@/lib/crackrevenue/performerCatalog";
import { fetchStreamatePerformers } from "@/lib/crackrevenue/api";

/** SSR / Workers: one performers-ext page per live/offline pass (fail-fast). */
export const PROFILE_LOOKUP_FAIL_FAST_MAX_PAGES = 1;

/** Optional deep scan (build scripts / offline jobs — not profile SSR). */
export const PROFILE_LOOKUP_DEEP_SCAN_MAX_PAGES = 25;

const SLUG_CACHE = new Map<string, { performer: CrackPerformer; at: number }>();
const MISS_CACHE = new Map<string, number>();
const CACHE_TTL_MS = 5 * 60 * 1000;
const MISS_CACHE_TTL_MS = 90 * 1000;

export type FindPerformerByProfileSlugOptions = {
  /** Bypass positive cache (e.g. live player API). Still fail-fast unless `deepScan`. */
  fresh?: boolean;
  /** Paginate up to catalog depth — never use on profile HTML SSR. */
  deepScan?: boolean;
};

async function fetchPerformerPage(
  live: boolean,
  page: number,
): Promise<CrackPerformer[]> {
  try {
    const data = await fetchStreamatePerformers({
      live,
      size: PERFORMER_CATALOG_PAGE_SIZE,
      page,
    });
    return data.performers ?? [];
  } catch {
    return [];
  }
}

async function scanForSlug(
  slug: string,
  live: boolean,
  maxPages: number,
): Promise<CrackPerformer | null> {
  const pages = Math.max(1, Math.min(maxPages, PROFILE_LOOKUP_DEEP_SCAN_MAX_PAGES));

  for (let page = 1; page <= pages; page += 1) {
    const pool = await fetchPerformerPage(live, page);
    const match = findInPerformerPool(pool, slug);
    if (match) return match;
    if (pool.length < PERFORMER_CATALOG_PAGE_SIZE) break;
  }

  return null;
}

function readPositiveCache(lookupSlugs: string[]): CrackPerformer | null {
  for (const key of lookupSlugs) {
    const cached = SLUG_CACHE.get(key);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
      return cached.performer;
    }
  }
  return null;
}

function isNegativeCacheHit(lookupSlugs: string[]): boolean {
  const now = Date.now();
  return lookupSlugs.some((key) => {
    const at = MISS_CACHE.get(key);
    return at != null && now - at < MISS_CACHE_TTL_MS;
  });
}

function storePositiveCache(
  lookupSlugs: string[],
  performer: CrackPerformer,
): void {
  const at = Date.now();
  for (const key of lookupSlugs) {
    SLUG_CACHE.set(key, { performer, at });
    MISS_CACHE.delete(key);
  }
}

function storeNegativeCache(lookupSlugs: string[]): void {
  const at = Date.now();
  for (const key of lookupSlugs) {
    MISS_CACHE.set(key, at);
  }
}

export async function findPerformerByProfileSlug(
  slug: string,
  options?: FindPerformerByProfileSlugOptions,
): Promise<CrackPerformer | null> {
  const lookupSlugs = lookupKeysForProfileSlug(slug);
  if (lookupSlugs.length === 0) return null;

  const primarySlug = lookupSlugs[0];
  const maxPages = options?.deepScan
    ? PROFILE_LOOKUP_DEEP_SCAN_MAX_PAGES
    : PROFILE_LOOKUP_FAIL_FAST_MAX_PAGES;

  if (options?.fresh) {
    for (const key of lookupSlugs) {
      SLUG_CACHE.delete(key);
      MISS_CACHE.delete(key);
    }
  } else {
    const cached = readPositiveCache(lookupSlugs);
    if (cached) return cached;
    if (isNegativeCacheHit(lookupSlugs)) {
      return null;
    }
  }

  let match = await scanForSlug(primarySlug, true, maxPages);
  if (!match) {
    match = await scanForSlug(primarySlug, false, maxPages);
  }

  if (match) {
    storePositiveCache(lookupSlugs, match);
    return match;
  }

  if (!options?.fresh) {
    storeNegativeCache(lookupSlugs);
  }

  return null;
}
