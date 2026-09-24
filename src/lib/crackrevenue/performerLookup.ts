import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { fetchStreamatePerformers } from "@/lib/crackrevenue/api";
import { performerProfileSlug } from "@/lib/profile/performerHandle";

const SLUG_CACHE = new Map<string, { performer: CrackPerformer; at: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_PAGES = 12;

function slugFromPerformer(p: CrackPerformer): string {
  return (
    performerProfileSlug(p.nameClean || p.name) ??
    (p.nameClean || p.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "")
  );
}

function findInPool(pool: CrackPerformer[], slug: string): CrackPerformer | null {
  const exact = pool.find((p) => slugFromPerformer(p) === slug);
  if (exact) return exact;

  const loose = pool.find((p) => {
    const ps = slugFromPerformer(p);
    return ps.includes(slug) || slug.includes(ps);
  });
  return loose ?? null;
}

async function scanLivePages(slug: string): Promise<CrackPerformer | null> {
  const pageBatch = [1, 2, 3, 4];
  const responses = await Promise.all(
    pageBatch.map((page) =>
      fetchStreamatePerformers({ live: true, size: 100, page }),
    ),
  );

  for (const data of responses) {
    const match = findInPool(data.performers ?? [], slug);
    if (match) return match;
  }

  for (let page = 5; page <= MAX_PAGES; page += 1) {
    const data = await fetchStreamatePerformers({ live: true, size: 100, page });
    const pool = data.performers ?? [];
    const match = findInPool(pool, slug);
    if (match) return match;
    if (pool.length < 100) break;
  }

  return null;
}

export async function findPerformerByProfileSlug(
  slug: string,
): Promise<CrackPerformer | null> {
  const normalized = performerProfileSlug(slug);
  if (!normalized) return null;

  const cached = SLUG_CACHE.get(normalized);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.performer;
  }

  let match = await scanLivePages(normalized);

  if (!match) {
    for (let page = 1; page <= 4; page += 1) {
      const data = await fetchStreamatePerformers({
        live: false,
        size: 100,
        page,
      });
      match = findInPool(data.performers ?? [], normalized);
      if (match) break;
      if ((data.performers ?? []).length < 100) break;
    }
  }

  if (match) {
    SLUG_CACHE.set(normalized, { performer: match, at: Date.now() });
  }

  return match;
}
