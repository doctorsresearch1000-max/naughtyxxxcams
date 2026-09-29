import type { ModelSEOInput } from "@/lib/profile/seoContent";
import { introTemplateVariants } from "@/copy/model-page";
import { stableVariantIndex } from "@/lib/seo/seoVariants";

/** Minimum populated fields before we emit the long intro block. */
export const PROFILE_LONG_INTRO_MIN_FIELDS = 4;

export function countProfileDataFields(model: ModelSEOInput): number {
  let n = 0;
  if (model.name?.trim()) n += 1;
  if (model.language?.trim()) n += 1;
  if (model.country?.trim()) n += 1;
  if (model.bodyType?.trim()) n += 1;
  if (model.traits.length > 0) n += 1;
  if (model.age != null) n += 1;
  if (model.ethnicity?.trim()) n += 1;
  if (model.status) n += 1;
  return n;
}

export function pickIntroVariant(model: ModelSEOInput): string {
  const idx = stableVariantIndex(
    model.profileSlug || model.handle,
    introTemplateVariants.length,
  );
  const template = introTemplateVariants[idx];
  const live = model.status === "live";
  return template(model.name, model.language, model.country, live);
}

export function buildReducedIntroParagraphs(model: ModelSEOInput): string[] {
  const live = model.status === "live";
  const line1 = pickIntroVariant(model);
  const line2 = live
    ? `${model.name} is online now — use the primary button to open the official room.`
    : `${model.name} is offline — save the profile to get notified when she returns.`;
  return [line1, line2];
}

/** Jaccard-like similarity on word sets (0–1). */
export function textSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().split(/\W+/).filter(Boolean));
  const wordsB = new Set(b.toLowerCase().split(/\W+/).filter(Boolean));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let inter = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) inter += 1;
  }
  const union = wordsA.size + wordsB.size - inter;
  return union === 0 ? 0 : inter / union;
}

export const PROFILE_SIMILARITY_FAIL_THRESHOLD = 0.72;
