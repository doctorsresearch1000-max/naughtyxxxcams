import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { findPerformerByProfileSlug } from "@/lib/crackrevenue/performerLookup";
import {
  slugFromPerformer,
  PERFORMER_CATALOG_MAX_PAGES,
  PERFORMER_CATALOG_PAGE_SIZE,
} from "@/lib/crackrevenue/performerCatalog";
import { fetchStreamatePerformers } from "@/lib/crackrevenue/api";
import {
  modelPermalinkPath,
  performerProfileSlug,
} from "@/lib/profile/performerHandle";
import { profileCanonicalUrl } from "@/lib/seo/canonical";

export type PlayerRouteRedirectTarget = {
  path: string;
  canonicalUrl: string;
};

function normalizePlayerRouteId(raw: string): string {
  return decodeURIComponent(raw).trim().toLowerCase();
}

function performerMatchesPublicId(
  performer: CrackPerformer,
  id: string,
): boolean {
  const norm = normalizePlayerRouteId(id);
  const compact = norm.replace(/-/g, "");
  const slug = slugFromPerformer(performer);
  const candidates = [
    performer.itemId,
    performer.nameClean,
    performer.name,
    slug,
  ]
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    .map((v) => v.trim().toLowerCase().replace(/^@+/, ""));

  return candidates.some((c) => {
    if (c === norm) return true;
    return c.replace(/-/g, "") === compact;
  });
}

async function scanCatalogForPublicId(
  id: string,
  live: boolean,
): Promise<CrackPerformer | null> {
  for (let page = 1; page <= PERFORMER_CATALOG_MAX_PAGES; page += 1) {
    const data = await fetchStreamatePerformers({
      live,
      size: PERFORMER_CATALOG_PAGE_SIZE,
      page,
    });
    const pool = data.performers ?? [];
    const match = pool.find((p) => performerMatchesPublicId(p, id));
    if (match) return match;
    if (pool.length < PERFORMER_CATALOG_PAGE_SIZE) break;
  }
  return null;
}

export async function findPerformerByPublicId(
  id: string,
): Promise<CrackPerformer | null> {
  const norm = normalizePlayerRouteId(id);
  if (!norm) return null;

  const slug = performerProfileSlug(norm);
  if (slug) {
    const bySlug = await findPerformerByProfileSlug(slug);
    if (bySlug) return bySlug;
  }

  const live = await scanCatalogForPublicId(norm, true);
  if (live) return live;
  return scanCatalogForPublicId(norm, false);
}

export async function resolvePlayerRouteRedirect(
  id: string,
): Promise<PlayerRouteRedirectTarget | null> {
  const performer = await findPerformerByPublicId(id);
  if (!performer) return null;

  const slug = slugFromPerformer(performer);
  if (!slug) return null;

  const path = modelPermalinkPath(slug);
  return {
    path,
    canonicalUrl: profileCanonicalUrl(slug),
  };
}
