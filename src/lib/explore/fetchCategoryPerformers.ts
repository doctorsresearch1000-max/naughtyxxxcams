import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { fetchStreamatePerformers } from "@/lib/crackrevenue/api";
import type { ExploreCategoryConfig } from "@/lib/explore/categorySlugs";

export type FetchPerformersParams = {
  tags?: string;
  ethnicities?: string;
  ages?: string;
  size?: number;
  page?: number;
  live?: boolean;
};

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

function matchesClientHints(
  performer: CrackPerformer,
  hints?: string[],
): boolean {
  if (!hints?.length) return true;
  const blob = tagBlob(performer);
  return hints.some((hint) => blob.includes(hint.toLowerCase()));
}

export async function fetchCategoryPerformers(
  category: ExploreCategoryConfig | null,
  options?: { size?: number },
): Promise<{ performers: CrackPerformer[]; total: number }> {
  const size = options?.size ?? 24;

  if (!category) {
    const data = await fetchStreamatePerformers({ size, page: 1, live: true });
    const performers = data.performers ?? [];
    return {
      performers,
      total: data.count ?? performers.length,
    };
  }

  const data = await fetchStreamatePerformers({
    ...category.api,
    size: Math.min(size * 2, 100),
    page: 1,
    live: true,
  });

  let performers = (data.performers ?? []).filter((p) =>
    matchesClientHints(p, category.clientMatch),
  );

  if (performers.length < 4 && category.clientMatch?.length) {
    const broad = await fetchStreamatePerformers({
      size: 100,
      page: 1,
      live: true,
    });
    performers = (broad.performers ?? []).filter((p) =>
      matchesClientHints(p, category.clientMatch),
    );
  }

  return {
    performers: performers.slice(0, size),
    total: performers.length || data.count || 0,
  };
}
