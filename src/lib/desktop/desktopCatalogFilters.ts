import type { CrackPerformer } from "@/lib/crackrevenue/api";
import {
  filterPerformersBySearch,
  filterPerformersByTagSlug,
  sortPerformers,
  type ExploreSortMode,
} from "@/lib/explore/exploreGrid";

export type DesktopLanguageFilter = "any" | "en" | "es" | "fr";
export type DesktopQualityFilter = "any" | "hd";
export type DesktopShowTypeFilter = "any" | "solo" | "couple";

export type DesktopCatalogFilters = {
  search: string;
  language: DesktopLanguageFilter;
  quality: DesktopQualityFilter;
  showType: DesktopShowTypeFilter;
  interactiveToy: boolean;
  categorySlug: string | null;
  sort: ExploreSortMode;
};

export const DESKTOP_CATEGORY_PILLS: { id: string | null; label: string }[] = [
  { id: "trending", label: "TRENDING" },
  { id: "just-started", label: "JUST STARTED" },
  { id: "interactive", label: "INTERACTIVE TOYS" },
  { id: "live", label: "LIVE NOW" },
  { id: "teen", label: "18–21" },
  { id: "latina", label: "LATINA" },
  { id: "milf", label: "MILF" },
  { id: "asian", label: "ASIAN" },
  { id: "ebony", label: "EBONY" },
  { id: "blonde", label: "BLONDE" },
  { id: "brunette", label: "BRUNETTE" },
  { id: "petite", label: "PETITE" },
];

function tagBlob(performer: CrackPerformer): string {
  return [
    ...(performer.autoTags ?? []),
    ...(performer.characteristicsTags ?? []),
    ...(performer.customTags ?? []),
    performer.characteristic?.hairColor ?? "",
    performer.characteristic?.ethnicities?.join(" ") ?? "",
    performer.characteristic?.bodyTypes?.join(" ") ?? "",
  ]
    .join(" ")
    .toLowerCase();
}

function matchesLanguage(
  performer: CrackPerformer,
  language: DesktopLanguageFilter,
): boolean {
  if (language === "any") return true;
  const langs = (performer.characteristic?.languages ?? []).map((l) =>
    l.toLowerCase(),
  );
  if (langs.length === 0) return language === "en";
  return langs.some((l) => l.startsWith(language));
}

function matchesQuality(
  performer: CrackPerformer,
  quality: DesktopQualityFilter,
): boolean {
  if (quality === "any") return true;
  const blob = tagBlob(performer);
  return blob.includes("hd") || blob.includes("1080");
}

function matchesShowType(
  performer: CrackPerformer,
  showType: DesktopShowTypeFilter,
): boolean {
  if (showType === "any") return true;
  const blob = tagBlob(performer);
  if (showType === "couple") {
    return blob.includes("couple") || blob.includes("duo");
  }
  return !blob.includes("couple") && !blob.includes("duo");
}

function matchesInteractiveToy(performer: CrackPerformer, on: boolean): boolean {
  if (!on) return true;
  const blob = tagBlob(performer);
  return (
    blob.includes("toy") ||
    blob.includes("interactive") ||
    blob.includes("lovense")
  );
}

function matchesCategoryPill(
  performer: CrackPerformer,
  categorySlug: string | null,
): boolean {
  if (!categorySlug) return true;
  const blob = tagBlob(performer);
  const age = performer.characteristic?.age;

  switch (categorySlug) {
    case "trending":
      return (performer.systemScore ?? 0) >= 0.35 || performer.live === true;
    case "just-started":
      return (performer.systemScore ?? 0) < 0.25;
    case "interactive":
      return matchesInteractiveToy(performer, true);
    case "live":
      return performer.live !== false;
    case "teen":
      return typeof age === "number" && age >= 18 && age <= 21;
    case "latina":
      return blob.includes("latina") || blob.includes("latin");
    case "milf":
      return blob.includes("milf") || (typeof age === "number" && age >= 30);
    case "asian":
      return blob.includes("asian");
    case "ebony":
      return blob.includes("ebony") || blob.includes("black");
    case "blonde":
      return blob.includes("blonde");
    case "brunette":
      return blob.includes("brunette") || blob.includes("brown");
    case "petite":
      return blob.includes("petite") || blob.includes("small");
    default:
      return filterPerformersByTagSlug([performer], categorySlug).length > 0;
  }
}

export function applyDesktopCatalogFilters<T extends CrackPerformer>(
  performers: T[],
  filters: DesktopCatalogFilters,
): T[] {
  let list: T[] = [...performers];
  list = filterPerformersBySearch(list, filters.search) as T[];
  list = list.filter((p) => matchesLanguage(p, filters.language));
  list = list.filter((p) => matchesQuality(p, filters.quality));
  list = list.filter((p) => matchesShowType(p, filters.showType));
  list = list.filter((p) => matchesInteractiveToy(p, filters.interactiveToy));
  list = list.filter((p) => matchesCategoryPill(p, filters.categorySlug));
  list = sortPerformers(list, filters.sort === "all" ? "trending" : filters.sort) as T[];
  return list;
}

export function performerStarRating(performer: CrackPerformer): number {
  if (typeof performer.stars === "number" && performer.stars > 0) {
    return Math.min(5, Math.max(1, performer.stars));
  }
  const score = performer.systemScore ?? 0.5;
  return Math.min(5, Math.max(3, 3.2 + score * 1.8));
}

export function performerMetaLine(performer: CrackPerformer): string {
  const parts: string[] = [];
  const hair = performer.characteristic?.hairColor;
  const eth = performer.characteristic?.ethnicities?.[0];
  const lang = performer.characteristic?.languages?.[0];
  if (hair) parts.push(`${hair} hair`);
  if (eth) parts.push(eth.toLowerCase());
  if (lang) parts.push(`lang${lang.toLowerCase()}`);
  return parts.join(" · ") || "live cam · hd";
}
