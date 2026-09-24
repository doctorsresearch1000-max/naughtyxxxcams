import {
  API_AGE_SLUGS,
  API_ETHNICITY_SLUGS,
  API_TAG_SLUGS,
} from "./config";
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

function formatTitle(value: string): string {
  if (value.startsWith("gc_")) {
    return AGE_LABELS[value] ?? value.replace("gc_", "").replace("_", "-");
  }
  return value
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeTitle(title: string): string {
  return title.trim().toUpperCase();
}

type UniqueRegistry = {
  usedCovers: Set<string>;
  usedPerformers: Set<string>;
};

async function pickUniqueCover(
  def: CategoryDefinition,
  registry: UniqueRegistry,
): Promise<string | null> {
  const baseParams =
    def.filterType === "tag"
      ? { tags: def.filterValue }
      : def.filterType === "ethnicity"
        ? { ethnicities: def.filterValue }
        : { ages: def.filterValue };

  for (let page = 1; page <= 4; page += 1) {
    const data = await fetchStreamatePerformers({
      ...baseParams,
      page,
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
  }

  return null;
}

async function resolveCategory(
  def: CategoryDefinition,
  registry: UniqueRegistry,
): Promise<ExploreCategory | null> {
  const params =
    def.filterType === "tag"
      ? { tags: def.filterValue, size: 1 }
      : def.filterType === "ethnicity"
        ? { ethnicities: def.filterValue, size: 1 }
        : { ages: def.filterValue, size: 1 };

  const data = await fetchStreamatePerformers(params);
  const coverUrl = await pickUniqueCover(def, registry);

  const category: ExploreCategory = {
    id: `${def.filterType}:${def.filterValue}`,
    title: formatTitle(def.filterValue).toUpperCase(),
    coverUrl,
    liveCount: data.count ?? 0,
    filterType: def.filterType,
    filterValue: def.filterValue,
  };

  if (category.liveCount <= 0 && !category.coverUrl) {
    return null;
  }

  return category;
}

function dedupeCategories(categories: ExploreCategory[]): ExploreCategory[] {
  const byId = new Map<string, ExploreCategory>();
  const byTitle = new Map<string, ExploreCategory>();
  const coverGuard = new Set<string>();

  const sorted = [...categories].sort((a, b) => b.liveCount - a.liveCount);

  for (const cat of sorted) {
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

  return Array.from(byId.values()).sort((a, b) => b.liveCount - a.liveCount);
}

/** Carga categorías oficiales de la API sin duplicados y con portadas únicas. */
export async function fetchAllExploreCategories(): Promise<ExploreCategory[]> {
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

  const resolved: ExploreCategory[] = [];
  for (const def of definitions) {
    const category = await resolveCategory(def, registry);
    if (category) resolved.push(category);
  }

  return dedupeCategories(resolved);
}
