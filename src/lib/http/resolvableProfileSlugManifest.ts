import manifest from "@/generated/resolvable-profile-slugs.json";
import {
  performerProfileSlug,
  performerProfileSlugLegacyCompact,
} from "@/lib/profile/performerHandle";

const RESOLVABLE_PROFILE_SLUG_KEYS = new Set<string>(
  Array.isArray(manifest) ? manifest : [],
);

function lookupKeysForHandle(slug: string): string[] {
  const normalized = performerProfileSlug(slug);
  if (!normalized) return [];
  const compact = performerProfileSlugLegacyCompact(normalized);
  return [normalized, compact].filter(
    (value, index, arr) => value && arr.indexOf(value) === index,
  );
}

/** False when build manifest is empty (middleware fail-open). */
export function hasResolvableProfileSlugManifest(): boolean {
  return RESOLVABLE_PROFILE_SLUG_KEYS.size > 0;
}

export function isHandleInResolvableProfileManifest(handleRaw: string): boolean {
  if (!hasResolvableProfileSlugManifest()) return true;
  const keys = lookupKeysForHandle(handleRaw);
  if (keys.length === 0) return false;
  return keys.some((key) => RESOLVABLE_PROFILE_SLUG_KEYS.has(key));
}
