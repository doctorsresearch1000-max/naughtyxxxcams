import type { CrackPerformer } from "@/lib/crackrevenue/api";
import {
  findInPerformerPool,
  slugFromPerformer,
} from "@/lib/crackrevenue/performerCatalog";
import { findPerformerByProfileSlug } from "@/lib/crackrevenue/performerLookup";
import { sanitizeModelSlug } from "@/lib/seo/modelPermalink";

function slugFromPerformerRecord(performer: CrackPerformer): string | null {
  const slug = slugFromPerformer(performer);
  return slug ? sanitizeModelSlug(slug) : null;
}

/**
 * Resolves `/live/[id]` and `/watch/[id]` route params to a canonical profile slug.
 * Accepts profile slugs, legacy compact slugs, or performer `itemId`.
 */
export async function resolvePlayerRouteSlug(
  rawId: string,
): Promise<string | null> {
  const decoded = decodeURIComponent(rawId).trim();
  if (!decoded) return null;

  const asSlug = sanitizeModelSlug(decoded);
  if (asSlug) {
    const bySlug = await findPerformerByProfileSlug(asSlug);
    if (bySlug) {
      return slugFromPerformerRecord(bySlug) ?? asSlug;
    }
  }

  const compact = decoded.toLowerCase().replace(/[^a-z0-9]+/g, "");
  if (compact && compact !== asSlug) {
    const byCompact = await findPerformerByProfileSlug(compact);
    if (byCompact) {
      return slugFromPerformerRecord(byCompact);
    }
  }

  const needle = decoded.toLowerCase();
  const matchByItemId = await findPerformerByItemId(needle);
  if (matchByItemId) {
    return slugFromPerformerRecord(matchByItemId);
  }

  return null;
}

async function findPerformerByItemId(
  itemId: string,
): Promise<CrackPerformer | null> {
  const { fetchStreamatePerformers } = await import("@/lib/crackrevenue/api");
  const { PERFORMER_CATALOG_MAX_PAGES, PERFORMER_CATALOG_PAGE_SIZE } =
    await import("@/lib/crackrevenue/performerCatalog");

  for (const live of [true, false] as const) {
    for (let page = 1; page <= PERFORMER_CATALOG_MAX_PAGES; page += 1) {
      const data = await fetchStreamatePerformers({
        live,
        size: PERFORMER_CATALOG_PAGE_SIZE,
        page,
      });
      const pool = data.performers ?? [];
      const direct = pool.find(
        (p) => p.itemId?.toLowerCase() === itemId.toLowerCase(),
      );
      if (direct) return direct;

      const viaPool = findInPerformerPool(pool, itemId);
      if (viaPool) return viaPool;

      if (pool.length < PERFORMER_CATALOG_PAGE_SIZE) break;
    }
  }

  return null;
}
