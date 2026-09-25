import type { CrackPerformer } from "@/lib/crackrevenue/api";
import {
  filterPerformersBySearch,
  sortPerformers,
  type ExploreSortMode,
} from "@/lib/explore/exploreGrid";
import {
  bodyTypeMatches,
  ethnicityIncludes,
  hairColorMatches,
  languageMatchesCode,
  performerLanguages,
  performerTagBlob,
  tagIncludes,
} from "@/lib/desktop/performerCatalogMeta";

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

function matchesLanguage(
  performer: CrackPerformer,
  language: DesktopLanguageFilter,
): boolean {
  if (language === "any") return true;
  return languageMatchesCode(performer, language);
}

function matchesQuality(
  performer: CrackPerformer,
  quality: DesktopQualityFilter,
): boolean {
  if (quality === "any") return true;
  const tags = performerTagBlob(performer);
  return (
    tagIncludes(performer, "hd") ||
    tags.includes("1080") ||
    tags.includes("720p")
  );
}

function matchesShowType(
  performer: CrackPerformer,
  showType: DesktopShowTypeFilter,
): boolean {
  if (showType === "any") return true;
  const tags = performerTagBlob(performer);
  if (showType === "couple") {
    return (
      tagIncludes(performer, "couple") ||
      tagIncludes(performer, "duo") ||
      tags.includes("couples")
    );
  }
  return (
    !tagIncludes(performer, "couple") &&
    !tagIncludes(performer, "duo") &&
    !tags.includes("couples")
  );
}

function matchesInteractiveToy(performer: CrackPerformer, on: boolean): boolean {
  if (!on) return true;
  return (
    tagIncludes(performer, "interactive") ||
    tagIncludes(performer, "toy") ||
    tagIncludes(performer, "lovense") ||
    tagIncludes(performer, "ohmibod")
  );
}

function matchesCategoryPill(
  performer: CrackPerformer,
  categorySlug: string | null,
): boolean {
  if (!categorySlug || categorySlug === "trending") return true;

  const age = performer.characteristic?.age;

  switch (categorySlug) {
    case "just-started":
      return (
        tagIncludes(performer, "new") ||
        tagIncludes(performer, "just started")
      );
    case "interactive":
      return matchesInteractiveToy(performer, true);
    case "live":
      return performer.live !== false;
    case "teen":
      if (typeof age === "number" && age >= 18 && age <= 21) return true;
      return (
        tagIncludes(performer, "teen") ||
        tagIncludes(performer, "18") ||
        tagIncludes(performer, "gc_18")
      );
    case "latina":
      return (
        ethnicityIncludes(performer, "latina") ||
        ethnicityIncludes(performer, "latin") ||
        tagIncludes(performer, "latina")
      );
    case "milf":
      return tagIncludes(performer, "milf") || tagIncludes(performer, "mature");
    case "asian":
      return (
        ethnicityIncludes(performer, "asian") || tagIncludes(performer, "asian")
      );
    case "ebony":
      return (
        ethnicityIncludes(performer, "ebony") ||
        ethnicityIncludes(performer, "black") ||
        tagIncludes(performer, "ebony")
      );
    case "blonde":
      return hairColorMatches(performer, "blonde", "blond");
    case "brunette":
      return hairColorMatches(performer, "brunette", "brown");
    case "petite":
      return (
        bodyTypeMatches(performer, "petite") ||
        tagIncludes(performer, "petite") ||
        tagIncludes(performer, "small")
      );
    default:
      return true;
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

  const sortMode =
    filters.categorySlug === "trending" || filters.sort === "trending"
      ? "trending"
      : filters.sort === "all"
        ? "hot"
        : filters.sort;

  list = sortPerformers(list, sortMode) as T[];
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
  const eth = performer.characteristic?.ethnicities?.[0];
  const lang = performerLanguages(performer)[0];
  const hair = performer.characteristic?.hairColor;
  if (eth) parts.push(eth);
  if (hair) parts.push(`${hair} hair`);
  if (lang) parts.push(lang);
  return parts.join(" · ") || "live · hd";
}
