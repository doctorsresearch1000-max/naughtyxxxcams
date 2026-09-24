import {
  API_AGE_SLUGS,
  API_ETHNICITY_SLUGS,
  API_TAG_SLUGS,
} from "./config";
import type { CrackPerformer } from "./api";
import {
  fetchStreamatePerformers,
  getPerformerKey,
  pickCoverUrl,
} from "./api";

export type ExploreCategory = {
  id: string;
  title: string;
  coverUrl: string | null;
  liveCount: number;
  filterType: "tag" | "ethnicity" | "age";
  filterValue: string;
};

type CategoryDefinition = {
  filterType: ExploreCategory["filterType"];
  filterValue: string;
};

const AGE_LABELS: Record<string, string> = {
  gc_18_19: "18-19",
  gc_20_29: "20-29",
  gc_30_39: "30-39",
  gc_40_49: "40-49",
  gc_50_plus: "50+",
};

const MAX_CATEGORY_BUILD_MS = 12_000;

function formatTitle(value: string): string {
  try {
    if (!value) return "CATEGORY";
    if (value.startsWith("gc_")) {
      return AGE_LABELS[value] ?? value.replace("gc_", "").replace("_", "-");
    }
    return value
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  } catch {
    return "CATEGORY";
  }
}

function normalizeTitle(title: string): string {
  return (title || "").trim().toUpperCase();
}

type UniqueRegistry = {
  usedCovers: Set<string>;
  usedPerformers: Set<string>;
};

function performerMatchesDefinition(
  performer: CrackPerformer,
  def: CategoryDefinition,
): boolean {
  const tagBlob = [
    ...(performer.autoTags ?? []),
    ...(performer.characteristicsTags ?? []),
    ...(performer.customTags ?? []),
  ]
    .join(" ")
    .toLowerCase();

  const value = def.filterValue.toLowerCase();

  if (def.filterType === "ethnicity") {
    const ethnicities = performer.characteristic?.ethnicities ?? [];
    return ethnicities.some((e) => e.toLowerCase().includes(value));
  }

  if (def.filterType === "age") {
    return tagBlob.includes(value.replace("gc_", "gc_"));
  }

  return tagBlob.includes(value);
}

function takeCoverFromPool(
  def: CategoryDefinition,
  pool: CrackPerformer[],
  registry: UniqueRegistry,
): string | null {
  try {
    for (const performer of pool) {
      if (!performerMatchesDefinition(performer, def)) continue;
      const cover = pickCoverUrl(performer);
      const performerKey = getPerformerKey(performer);
      if (!cover) continue;
      if (registry.usedCovers.has(cover)) continue;
      if (registry.usedPerformers.has(performerKey)) continue;

      registry.usedCovers.add(cover);
      registry.usedPerformers.add(performerKey);
      return cover;
    }
  } catch {
    return null;
  }
  return null;
}

async function pickUniqueCover(
  def: CategoryDefinition,
  registry: UniqueRegistry,
): Promise<string | null> {
  try {
    const baseParams =
      def.filterType === "tag"
        ? { tags: def.filterValue }
        : def.filterType === "ethnicity"
          ? { ethnicities: def.filterValue }
          : { ages: def.filterValue };

    const data = await fetchStreamatePerformers({
      ...baseParams,
      page: 1,
      size: 20,
    });

    for (const performer of data.performers ?? []) {
      const cover = pickCoverUrl(performer);
      const performerKey = getPerformerKey(performer);
      if (!cover) continue;
      if (registry.usedCovers.has(cover)) continue;
      if (registry.usedPerformers.has(performerKey)) continue;

      registry.usedCovers.add(cover);
      registry.usedPerformers.add(performerKey);
      return cover;
    }
  } catch {
    return null;
  }

  return null;
}

async function resolveCategory(
  def: CategoryDefinition,
  registry: UniqueRegistry,
  pool: CrackPerformer[],
): Promise<ExploreCategory | null> {
  try {
    const params =
      def.filterType === "tag"
        ? { tags: def.filterValue, size: 1 }
        : def.filterType === "ethnicity"
          ? { ethnicities: def.filterValue, size: 1 }
          : { ages: def.filterValue, size: 1 };

    const data = await fetchStreamatePerformers(params);
    const coverFromPool = takeCoverFromPool(def, pool, registry);
    const coverUrl =
      coverFromPool ?? (await pickUniqueCover(def, registry));

    const category: ExploreCategory = {
      id: `${def.filterType}:${def.filterValue}`,
      title: formatTitle(def.filterValue).toUpperCase(),
      coverUrl,
      liveCount: Number(data.count) || 0,
      filterType: def.filterType,
      filterValue: def.filterValue,
    };

    if (category.liveCount <= 0 && !category.coverUrl) {
      return null;
    }

    return category;
  } catch {
    return null;
  }
}

export function dedupeCategories(
  categories: ExploreCategory[] | null | undefined,
): ExploreCategory[] {
  try {
    if (!Array.isArray(categories) || categories.length === 0) {
      return [];
    }

    const byId = new Map<string, ExploreCategory>();
    const byTitle = new Map<string, ExploreCategory>();
    const coverGuard = new Set<string>();

    const sorted = [...categories].sort(
      (a, b) => (b.liveCount || 0) - (a.liveCount || 0),
    );

    for (const cat of sorted) {
      if (!cat?.id) continue;
      if (byId.has(cat.id)) continue;

      const titleKey = normalizeTitle(cat.title);
      const existingByTitle = byTitle.get(titleKey);
      if (existingByTitle && existingByTitle.id !== cat.id) {
        continue;
      }

      if (cat.coverUrl) {
        if (coverGuard.has(cat.coverUrl)) continue;
        coverGuard.add(cat.coverUrl);
      }

      byId.set(cat.id, cat);
      byTitle.set(titleKey, cat);
    }

    return Array.from(byId.values()).sort(
      (a, b) => (b.liveCount || 0) - (a.liveCount || 0),
    );
  } catch {
    return [];
  }
}

/** Carga categorías de la API con fallbacks seguros (nunca lanza al SSR). */
export async function fetchAllExploreCategories(): Promise<ExploreCategory[]> {
  const startedAt = Date.now();

  try {
    const definitions: CategoryDefinition[] = [
      ...API_TAG_SLUGS.map((value) => ({
        filterType: "tag" as const,
        filterValue: value,
      })),
      ...API_ETHNICITY_SLUGS.map((value) => ({
        filterType: "ethnicity" as const,
        filterValue: value,
      })),
      ...API_AGE_SLUGS.map((value) => ({
        filterType: "age" as const,
        filterValue: value,
      })),
    ];

    const registry: UniqueRegistry = {
      usedCovers: new Set<string>(),
      usedPerformers: new Set<string>(),
    };

    let pool: CrackPerformer[] = [];
    try {
      const bulk = await fetchStreamatePerformers({ page: 1, size: 100 });
      pool = Array.isArray(bulk.performers) ? bulk.performers : [];
    } catch {
      pool = [];
    }

    const resolved: ExploreCategory[] = [];

    for (const def of definitions) {
      if (Date.now() - startedAt > MAX_CATEGORY_BUILD_MS) {
        break;
      }

      const category = await resolveCategory(def, registry, pool);
      if (category) resolved.push(category);
    }

    return dedupeCategories(resolved);
  } catch {
    return [];
  }
}
