import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { fetchStreamatePerformers } from "@/lib/crackrevenue/api";
import type { ExploreCategoryConfig } from "@/lib/explore/categorySlugs";

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
  if (ages === "gc_18_19" && age != null && age <= 19) return true;
  if (ages === "gc_20_29" && age != null && age >= 20 && age <= 29) return true;
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
  pages = 3,
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
  const size = options?.size ?? 24;
  const pool =
    options?.masterPool && options.masterPool.length > 0
      ? options.masterPool
      : await fetchExploreMasterPool(3);

  const filtered = filterPerformersForCategory(pool, category, pool.length);
  const performers = filtered.slice(0, size);

  return {
    performers,
    total: filtered.length,
  };
}
