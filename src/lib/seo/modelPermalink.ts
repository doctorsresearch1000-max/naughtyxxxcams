import {
  performerProfilePath,
  performerProfilePathFromPerformer,
  performerProfileSlug,
} from "@/lib/profile/performerHandle";

/** Strict public profile slug (lowercase, hyphenated). */
export const sanitizeModelSlug = performerProfileSlug;

/** Internal path `/profile/{slug}` for a sanitized slug. */
export function modelPermalinkPath(slug: string): string {
  const clean = sanitizeModelSlug(slug) ?? slug.trim().toLowerCase();
  return `/profile/${clean}`;
}

/** Internal profile URL from raw handle, nameClean, or itemId — or null if invalid. */
export const modelProfileHref = performerProfilePath;

/** Profile path from a Crack performer record (nameClean preferred). */
export const modelProfileHrefFromPerformer = performerProfilePathFromPerformer;
