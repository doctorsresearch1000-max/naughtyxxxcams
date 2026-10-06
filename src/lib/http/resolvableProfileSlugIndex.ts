import {
  collectResolvableProfileSlugs,
  lookupKeysForProfileSlug,
} from "@/lib/crackrevenue/performerCatalog";

/** Align with profile `revalidate` / edge HTML cache (seconds). */
export const RESOLVABLE_PROFILE_SLUG_INDEX_TTL_MS = 300_000;

type SlugIndexState = {
  index: Set<string>;
  loadedAt: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __nxResolvableProfileSlugIndex: SlugIndexState | undefined;
  // eslint-disable-next-line no-var
  var __nxResolvableProfileSlugIndexLoad: Promise<Set<string> | null> | undefined;
}

function readCachedIndex(): Set<string> | null {
  const state = globalThis.__nxResolvableProfileSlugIndex;
  if (!state) return null;
  if (Date.now() - state.loadedAt > RESOLVABLE_PROFILE_SLUG_INDEX_TTL_MS) {
    return null;
  }
  return state.index;
}

function writeCachedIndex(index: Set<string>): Set<string> {
  globalThis.__nxResolvableProfileSlugIndex = {
    index,
    loadedAt: Date.now(),
  };
  return index;
}

async function buildIndexFromCatalog(): Promise<Set<string> | null> {
  try {
    const slugs = await collectResolvableProfileSlugs();
    const index = new Set<string>();
    for (const slug of slugs) {
      for (const key of lookupKeysForProfileSlug(slug)) {
        index.add(key);
      }
    }
    return writeCachedIndex(index);
  } catch {
    return readCachedIndex();
  }
}

/**
 * In-memory slug set for edge middleware (one catalog load per isolate / TTL).
 * Returns `null` when the catalog cannot be loaded and no stale index exists (fail-open).
 */
export async function getResolvableProfileSlugIndex(): Promise<Set<string> | null> {
  const fresh = readCachedIndex();
  if (fresh) return fresh;

  if (!globalThis.__nxResolvableProfileSlugIndexLoad) {
    globalThis.__nxResolvableProfileSlugIndexLoad = buildIndexFromCatalog().finally(
      () => {
        globalThis.__nxResolvableProfileSlugIndexLoad = undefined;
      },
    );
  }

  return globalThis.__nxResolvableProfileSlugIndexLoad;
}

export function isHandleInResolvableProfileIndex(
  handleRaw: string,
  index: Set<string>,
): boolean {
  const keys = lookupKeysForProfileSlug(handleRaw);
  if (keys.length === 0) return false;
  return keys.some((key) => index.has(key));
}
