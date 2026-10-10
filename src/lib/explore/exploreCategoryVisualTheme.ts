import type { ExploreCategorySlug } from "@/lib/explore/categorySlugs";
import { EXPLORE_HUB_CATEGORY_SLUGS } from "@/lib/explore/exploreCategoryHubSlugs";

export const NAUGHTY_GREEN = "#39FF14";

export type ExploreCategoryVisualTheme = {
  background: string;
  accent: string;
  kicker: string;
  /** Self-hosted niche cover (not ads / not live thumbs). */
  coverImage: string;
};

type HubThemeSlug = (typeof EXPLORE_HUB_CATEGORY_SLUGS)[number];

const HUB_THEMES: Record<HubThemeSlug, ExploreCategoryVisualTheme> = {
  latinas: {
    background:
      "linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.45) 55%, transparent 100%)",
    accent: NAUGHTY_GREEN,
    kicker: "Latina live",
    coverImage: "/explore/categories/latinas.jpg",
  },
  verified: {
    background:
      "linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)",
    accent: NAUGHTY_GREEN,
    kicker: "Teen 18+",
    coverImage: "/explore/categories/verified.jpg",
  },
  milf: {
    background:
      "linear-gradient(90deg, rgba(0,0,0,0.93) 0%, rgba(0,0,0,0.5) 58%, transparent 100%)",
    accent: NAUGHTY_GREEN,
    kicker: "Mature & MILF",
    coverImage: "/explore/categories/milf.jpg",
  },
  petite: {
    background:
      "linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.48) 55%, transparent 100%)",
    accent: NAUGHTY_GREEN,
    kicker: "Petite & e-girl",
    coverImage: "/explore/categories/petite.jpg",
  },
  cosplay: {
    background:
      "linear-gradient(90deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.45) 55%, transparent 100%)",
    accent: NAUGHTY_GREEN,
    kicker: "Cosplay & fantasy",
    coverImage: "/explore/categories/cosplay.jpg",
  },
  couples: {
    background:
      "linear-gradient(90deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 58%, transparent 100%)",
    accent: NAUGHTY_GREEN,
    kicker: "Duo shows",
    coverImage: "/explore/categories/couples.jpg",
  },
};

const DEFAULT_THEME = HUB_THEMES.latinas;

export function themeForCategorySlug(
  slug: string | undefined | null,
): ExploreCategoryVisualTheme {
  if (!slug) return DEFAULT_THEME;
  const key = slug.trim().toLowerCase() as HubThemeSlug;
  return HUB_THEMES[key] ?? DEFAULT_THEME;
}

/** @deprecated Hub grid only uses HUB_THEMES; kept for type compatibility. */
export const EXPLORE_CATEGORY_VISUAL_THEMES: Partial<
  Record<ExploreCategorySlug, ExploreCategoryVisualTheme>
> = HUB_THEMES;
