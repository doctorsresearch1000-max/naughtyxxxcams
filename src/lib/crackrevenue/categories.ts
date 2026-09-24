import {
  API_AGE_SLUGS,
  API_ETHNICITY_SLUGS,
  API_TAG_SLUGS,
} from "./config";
import { fetchStreamatePerformers, pickCoverUrl } from "./api";

export type ExploreCategory = {
  id: string;
  title: string;
  coverUrl: string | null;
  liveCount: number;
  filterType: "tag" | "ethnicity" | "age";
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

async function resolveCategory(
  filterType: ExploreCategory["filterType"],
  filterValue: string,
): Promise<ExploreCategory> {
  const params =
    filterType === "tag"
      ? { tags: filterValue, size: 1 }
      : filterType === "ethnicity"
        ? { ethnicities: filterValue, size: 1 }
        : { ages: filterValue, size: 1 };

  const data = await fetchStreamatePerformers(params);
  const performer = data.performers?.[0];

  return {
    id: `${filterType}:${filterValue}`,
    title: formatTitle(filterValue).toUpperCase(),
    coverUrl: pickCoverUrl(performer),
    liveCount: data.count ?? 0,
    filterType,
    filterValue,
  };
}

async function mapInChunks<T, R>(
  items: readonly T[],
  mapper: (item: T) => Promise<R>,
  chunkSize = 8,
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(chunk.map(mapper));
    results.push(...chunkResults);
  }
  return results;
}

/** Carga todas las categorías oficiales de la API (tags, etnias, edades) con portada CTR. */
export async function fetchAllExploreCategories(): Promise<ExploreCategory[]> {
  const tagCategories = await mapInChunks(API_TAG_SLUGS, (tag) =>
    resolveCategory("tag", tag),
  );
  const ethnicityCategories = await mapInChunks(API_ETHNICITY_SLUGS, (eth) =>
    resolveCategory("ethnicity", eth),
  );
  const ageCategories = await mapInChunks(API_AGE_SLUGS, (age) =>
    resolveCategory("age", age),
  );

  const merged = [...tagCategories, ...ethnicityCategories, ...ageCategories];

  return merged
    .filter((cat) => cat.liveCount > 0 || cat.coverUrl)
    .sort((a, b) => b.liveCount - a.liveCount);
}
