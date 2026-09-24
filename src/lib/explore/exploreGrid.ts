import type { CrackPerformer } from "@/lib/crackrevenue/api";

export function formatExploreViews(performer: CrackPerformer): string {
  const score = performer.systemScore ?? 0;
  const seed =
    performer.itemId ||
    performer.nameClean ||
    performer.name ||
    "model";
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const n = 40_000 + Math.abs(hash % 920_000) + Math.round(score * 120_000);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  return `${Math.round(n / 1000)}K`;
}

export type ExploreSortMode = "all" | "hot" | "trending";

export function sortPerformers(
  list: CrackPerformer[],
  mode: ExploreSortMode,
): CrackPerformer[] {
  const copy = [...list];
  if (mode === "hot" || mode === "trending") {
    copy.sort(
      (a, b) => (b.systemScore ?? 0) - (a.systemScore ?? 0),
    );
  }
  return copy;
}

export function filterPerformersBySearch(
  list: CrackPerformer[],
  query: string,
): CrackPerformer[] {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter((p) => {
    const blob = [
      p.name,
      p.nameClean,
      ...(p.autoTags ?? []),
      ...(p.characteristicsTags ?? []),
    ]
      .join(" ")
      .toLowerCase();
    return blob.includes(q);
  });
}

export function filterPerformersByTagSlug(
  list: CrackPerformer[],
  tagSlug: string | null,
): CrackPerformer[] {
  if (!tagSlug) return list;
  const tag = tagSlug.toLowerCase();
  return list.filter((p) => {
    const blob = [
      ...(p.autoTags ?? []),
      ...(p.characteristicsTags ?? []),
      ...(p.customTags ?? []),
    ]
      .join(" ")
      .toLowerCase();
    return blob.includes(tag);
  });
}
