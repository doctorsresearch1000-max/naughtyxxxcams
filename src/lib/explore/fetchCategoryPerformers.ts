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
  apiTagBoost?: Set<string>,
): CrackPerformer[] {
  if (!category) {
    return pool.filter((p) => p.live !== false).slice(0, limit);
  }

  const filtered = pool.filter(
    (p) =>
      p.live !== false && matchesCategory(p, category, apiTagBoost),
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

function matchesClientHints(
  performer: CrackPerformer,
  clientMatch: string[] | undefined,
): boolean {
  if (!clientMatch?.length) return false;
  const blob = tagBlob(performer);
  return clientMatch.some((h) => blob.includes(h.toLowerCase()));
}

function matchesApiFilters(
  performer: CrackPerformer,
  category: ExploreCategoryConfig,
): boolean {
  const { api } = category;
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

  return true;
}

function matchesCategory(
  performer: CrackPerformer,
  category: ExploreCategoryConfig,
  apiTagBoost?: Set<string>,
): boolean {
  const key =
    performer.itemId || performer.nameClean || performer.name || "";
  if (key && apiTagBoost?.has(key)) return true;

  const { clientMatch } = category;
  if (clientMatch?.length && matchesClientHints(performer, clientMatch)) {
    return true;
  }

  if (clientMatch?.length && (category.api.tags || category.api.ethnicities)) {
    return false;
  }

  return matchesApiFilters(performer, category);
}

function performerKey(performer: CrackPerformer): string {
  return performer.itemId || performer.nameClean || performer.name || "";
}

function mergePerformerPools(
  base: CrackPerformer[],
  extra: CrackPerformer[],
): CrackPerformer[] {
  const seen = new Set(base.map(performerKey));
  const out = [...base];
  for (const performer of extra) {
    const key = performerKey(performer);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(performer);
  }
  return out;
}

async function fetchApiTagPerformers(
  tag: string,
): Promise<{ performers: CrackPerformer[]; keys: Set<string> }> {
  const keys = new Set<string>();
  const performers: CrackPerformer[] = [];

  const pages = 2;
  for (let page = 1; page <= pages; page++) {
    const data = await fetchStreamatePerformers({
      tags: tag,
      live: true,
      size: 100,
      page,
    });
    for (const performer of data.performers ?? []) {
      const key = performerKey(performer);
      if (!key || keys.has(key)) continue;
      keys.add(key);
      performers.push(performer);
    }
  }

  return { performers, keys };
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
  const settled = await Promise.allSettled(
    Array.from({ length: pages }, (_, i) =>
      fetchStreamatePerformers({ live: true, size: 100, page: i + 1 }),
    ),
  );

  const merged: CrackPerformer[] = [];
  const seen = new Set<string>();

  for (const result of settled) {
    if (result.status !== "fulfilled") continue;
    const data = result.value;
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
  let pool =
    options?.masterPool && options.masterPool.length > 0
      ? options.masterPool
      : await fetchExploreMasterPool();

  let apiTagBoost: Set<string> | undefined;
  const apiTag = category?.apiTagFetch?.trim();
  if (category && apiTag) {
    const tagged = await fetchApiTagPerformers(apiTag);
    apiTagBoost = tagged.keys;
    pool = mergePerformerPools(pool, tagged.performers);
  }

  const filtered = filterPerformersForCategory(
    pool,
    category,
    pool.length,
    apiTagBoost,
  );
  const performers = filtered.slice(0, size);

  return {
    performers,
    total: filtered.length,
  };
}
