import { fetchExploreMasterPool } from "@/lib/explore/fetchCategoryPerformers";
import {
  toRecommendedProfile,
  type RecommendedProfile,
} from "@/lib/profile/profilePresentation";

export async function fetchRecommendedProfiles(
  excludeSlug: string,
  limit = 6,
): Promise<RecommendedProfile[]> {
  const pool = await fetchExploreMasterPool(2);
  const out: RecommendedProfile[] = [];

  for (const performer of pool) {
    const rec = toRecommendedProfile(performer);
    if (!rec || rec.slug === excludeSlug) continue;
    if (out.some((r) => r.slug === rec.slug)) continue;
    out.push(rec);
    if (out.length >= limit) break;
  }

  return out;
}
