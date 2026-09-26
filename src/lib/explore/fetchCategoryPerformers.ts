import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { fetchStreamatePerformers } from "@/lib/crackrevenue/api";
import type { ExploreCategoryConfig } from "@/lib/explore/categorySlugs";
import {
  EXPLORE_DISPLAY_LIMIT,
  EXPLORE_MASTER_POOL_PAGES,
} from "@/lib/explore/exploreLimits";

export function filterPerformersForCategory(
  pool: CrackPerformer[],
  category: ExploreCategoryConfig | null,
  limit = 24,
): CrackPerformer[] {
  if (!category) {
    return pool.filter((p) => p.live !== false).slice(0, limit);
  }

  const filtered = pool.filter(
    (p) => p.live !== false && matchesCategory(p, category),
  );

  return filtered.slice(0, limit);
}

function tagBlob(performer: CrackPerformer): string {
  return [
    ...(performer.autoTags ?? []),
    ...(performer.characteristicsTags ?? []),
    ...(performer.customTags ?? []),
    performer.name ?? "",
    performer.nameClean ?? "",
  ]
    .join(" ")
    .toLowerCase();
}

function matchesEthnicity(performer: CrackPerformer, value: string): boolean {
  const ethnicities = performer.characteristic?.ethnicities ?? [];
  return ethnicities.some((e) => e.toLowerCase().includes(value.toLowerCase()));
}

function matchesAgeBucket(performer: CrackPerformer, ages: string): boolean {
  const tags = (performer.customTags ?? []).map((t) => t.toLowerCase());
  if (tags.some((t) => t.includes(ages.toLowerCase()))) return true;
  const age = performer.characteristic?.age;
  if (age == null) return false;
  if (ages === "gc_18_19") return age <= 19;
  if (ages === "gc_20_29") return age >= 20 && age <= 29;
  if (ages === "gc_30_39") return age >= 30 && age <= 39;
  if (ages === "gc_40_49") return age >= 40 && age <= 49;
  if (ages === "gc_50_plus") return age >= 50;
  return false;
}

function matchesCategory(
  performer: CrackPerformer,
  category: ExploreCategoryConfig,
): boolean {
  const { api, clientMatch } = category;
  const blob = tagBlob(performer);

  if (api.ethnicities && !matchesEthnicity(performer, api.ethnicities)) {
    return false;
  }

  if (api.ages && !matchesAgeBucket(performer, api.ages)) {
    return false;
  }

  if (api.tags && !blob.includes(api.tags.toLowerCase())) {
    return false;
  }

  if (clientMatch?.length) {
    return clientMatch.some((h) => blob.includes(h.toLowerCase()));
  }

  return true;
}

export type FetchPerformersParams = {
  tags?: string;
  ethnicities?: string;
  ages?: string;
  size?: number;
  page?: number;
  live?: boolean;
};

export async function fetchExploreMasterPool(
  pages = EXPLORE_MASTER_POOL_PAGES,
): Promise<CrackPerformer[]> {
  const responses = await Promise.all(
    Array.from({ length: pages }, (_, i) =>
      fetchStreamatePerformers({ live: true, size: 100, page: i + 1 }),
    ),
  );

  const merged: CrackPerformer[] = [];
  const seen = new Set<string>();

  for (const data of responses) {
    for (const p of data.performers ?? []) {
      const key = p.itemId || p.nameClean || p.name || "";
      if (!key || seen.has(key)) continue;
      seen.add(key);
      merged.push(p);
    }
  }

  return merged;
}

export async function fetchCategoryPerformers(
  category: ExploreCategoryConfig | null,
  options?: { size?: number; masterPool?: CrackPerformer[] },
): Promise<{ performers: CrackPerformer[]; total: number }> {
  const size = options?.size ?? EXPLORE_DISPLAY_LIMIT;
  const pool =
    options?.masterPool && options.masterPool.length > 0
      ? options.masterPool
      : await fetchExploreMasterPool();

  const filtered = filterPerformersForCategory(pool, category, pool.length);
  const performers = filtered.slice(0, size);

  return {
    performers,
    total: filtered.length,
  };
}
