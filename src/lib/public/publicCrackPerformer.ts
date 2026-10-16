import type { CrackPerformer } from "@/lib/crackrevenue/api";

/** Fields safe to serialize to browsers / public JSON APIs. */
export type PublicCrackPerformer = Omit<CrackPerformer, "roomUrl">;

export function toPublicCrackPerformer(
  performer: CrackPerformer,
): PublicCrackPerformer {
  const { roomUrl: _roomUrl, ...rest } = performer;
  return rest;
}

export function toPublicCrackPerformers(
  performers: CrackPerformer[],
): PublicCrackPerformer[] {
  return performers.map(toPublicCrackPerformer);
}
