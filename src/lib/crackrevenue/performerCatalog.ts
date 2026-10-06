import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { fetchStreamatePerformers } from "@/lib/crackrevenue/api";
import {
  performerProfileSlug,
  performerProfileSlugLegacyCompact,
} from "@/lib/profile/performerHandle";

/** Shared ingest depth for sitemap + profile lookup (must stay in sync). */
export const PERFORMER_CATALOG_PAGE_SIZE = 100;
export const PERFORMER_CATALOG_MAX_PAGES = 25;

export function slugFromPerformer(p: CrackPerformer): string {
  return (
    performerProfileSlug(p.nameClean || p.name) ??
    performerProfileSlug(p.itemId) ??
    ""
  );
}

export function lookupKeysForProfileSlug(slug: string): string[] {
  const normalized = performerProfileSlug(slug);
  if (!normalized) return [];
  const compact = performerProfileSlugLegacyCompact(normalized);
  return [normalized, compact].filter(
    (value, index, arr) => value && arr.indexOf(value) === index,
  );
}

export function findInPerformerPool(
  pool: CrackPerformer[],
  slug: string,
): CrackPerformer | null {
  const keys = lookupKeysForProfileSlug(slug);
  if (keys.length === 0) return null;

  for (const key of keys) {
    const exact = pool.find((p) => slugFromPerformer(p) === key);
    if (exact) return exact;
  }

  for (const key of keys) {
    const loose = pool.find((p) => {
      const ps = slugFromPerformer(p);
      return ps.includes(key) || key.includes(ps);
    });
    if (loose) return loose;
  }

  return null;
}

/** Paginates performers-ext with the canonical catalog depth. */
export async function fetchPerformerCatalogPool(
  live: boolean,
): Promise<CrackPerformer[]> {
  const pool: CrackPerformer[] = [];

  for (let page = 1; page <= PERFORMER_CATALOG_MAX_PAGES; page += 1) {
    const data = await fetchStreamatePerformers({
      live,
      size: PERFORMER_CATALOG_PAGE_SIZE,
      page,
    });
    const performers = data.performers ?? [];
    if (performers.length === 0) break;
    pool.push(...performers);
    if (performers.length < PERFORMER_CATALOG_PAGE_SIZE) break;
  }

  return pool;
}

export async function loadFullPerformerCatalog(): Promise<CrackPerformer[]> {
  const [live, offline] = await Promise.all([
    fetchPerformerCatalogPool(true),
    fetchPerformerCatalogPool(false),
  ]);
  return [...live, ...offline];
}

/**
 * Canonical public profile slugs resolvable via the same catalog as `/profile/[handle]`.
 */
export async function collectResolvableProfileSlugs(): Promise<string[]> {
  const pool = await loadFullPerformerCatalog();
  const slugs = new Set<string>();

  for (const performer of pool) {
    const slug = slugFromPerformer(performer);
    if (!slug) continue;
    if (findInPerformerPool(pool, slug)) {
      slugs.add(slug);
    }
  }

  return Array.from(slugs).sort((a, b) => a.localeCompare(b));
}
