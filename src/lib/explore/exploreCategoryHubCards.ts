import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { pickCoverUrl } from "@/lib/crackrevenue/api";
import type { ExploreCategory } from "@/lib/crackrevenue/categories";
import {
  EXPLORE_CATEGORY_MAP,
  EXPLORE_CATEGORY_SLUGS,
  type ExploreCategorySlug,
} from "@/lib/explore/categorySlugs";
import { filterPerformersForCategory } from "@/lib/explore/fetchCategoryPerformers";
import {
  explorePathForCategorySlug,
  explorePathFromFeedCategory,
} from "@/lib/explore/paths";

export type ExploreCategoryHubCard = {
  id: string;
  slug: string;
  label: string;
  href: string;
  coverUrl: string | null;
  liveCount: number;
};

/** Curated local art direction when the live pool has no match yet. */
const FALLBACK_COVERS: Record<ExploreCategorySlug, string> = {
  latinas: "/ads/jerkmate/92e58503-d0cf-45a4-bf19-dc54e93b3caa.jpg",
  verified: "/ads/jerkmate/29a64ccc-f967-4f61-9488-641c929db2de.jpg",
  milf: "/ads/jerkmate/b0b140d7-72c0-41e5-891b-b2ec67b785ca.jpg",
  petite: "/ads/jerkmate/9371fb3f-811f-45e0-84a6-9cdad7626054.jpg",
  cosplay: "/ads/jerkmate/0387e7fd-1abc-472e-8049-8f746cadc8b0.jpg",
  couples: "/ads/jerkmate/cec523a9-78c0-4f14-b757-f245623efcdf.jpg",
  trans: "/ads/jerkmate/95bb1ea3-a139-413e-872f-c89a643e3794.jpg",
  alt: "/ads/jerkmate/a1fa4767-f4f3-4ea7-bbf0-79ce41b31425.jpg",
};

function pickCategoryCover(
  performers: CrackPerformer[],
  slug: ExploreCategorySlug,
): string {
  const sorted = [...performers]
    .filter((p) => p.live !== false)
    .sort((a, b) => (b.systemScore ?? 0) - (a.systemScore ?? 0));

  for (const performer of sorted) {
    const url = pickCoverUrl(performer);
    if (url?.trim()) return url.trim();
  }

  return FALLBACK_COVERS[slug];
}

/** Slushy hub cards — live thumbs first, Naughty fallback art. */
export function buildExploreCategoryHubCards(
  masterPool: CrackPerformer[],
): ExploreCategoryHubCard[] {
  return EXPLORE_CATEGORY_SLUGS.map((slug) => {
    const config = EXPLORE_CATEGORY_MAP[slug];
    const filtered = filterPerformersForCategory(
      masterPool,
      config,
      masterPool.length,
    );
    const liveCount = filtered.filter((p) => p.live !== false).length;

    return {
      id: slug,
      slug,
      label: config.label,
      href: explorePathForCategorySlug(slug),
      coverUrl: pickCategoryCover(filtered, slug),
      liveCount,
    };
  });
}

export function hubCardsFromApiCategories(
  categories: ExploreCategory[],
  masterPool: CrackPerformer[],
): ExploreCategoryHubCard[] {
  const bySlug = new Map(
    buildExploreCategoryHubCards(masterPool).map((c) => [c.slug, c]),
  );

  return categories.map((cat, index) => {
    const slugGuess = cat.filterValue?.replace(/\s+/g, "-").toLowerCase() ?? "";
    const fallback = bySlug.get(slugGuess as ExploreCategorySlug);
    const cover =
      cat.coverUrl?.trim() || fallback?.coverUrl || FALLBACK_COVERS.latinas;

    return {
      id: cat.id ?? `cat-${index}`,
      slug: slugGuess || cat.id,
      label: cat.title,
      href: explorePathFromFeedCategory(cat),
      coverUrl: cover,
      liveCount: cat.liveCount ?? fallback?.liveCount ?? 0,
    };
  });
}
