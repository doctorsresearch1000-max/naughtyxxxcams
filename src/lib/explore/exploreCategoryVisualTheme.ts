import type { ExploreCategorySlug } from "@/lib/explore/categorySlugs";

export type ExploreCategoryVisualTheme = {
  /** CSS gradient for poster background */
  background: string;
  /** Accent line / glow */
  accent: string;
  /** Optional oversized watermark letter */
  watermark: string;
  /** Short editorial line under the title */
  kicker: string;
};

export const EXPLORE_CATEGORY_VISUAL_THEMES: Record<
  ExploreCategorySlug,
  ExploreCategoryVisualTheme
> = {
  latinas: {
    background:
      "linear-gradient(145deg, #3d0a1f 0%, #ff007f 42%, #1a0510 100%)",
    accent: "#ff4da6",
    watermark: "L",
    kicker: "Live Latina cams",
  },
  verified: {
    background:
      "linear-gradient(160deg, #0b0f19 0%, #00f0ff22 35%, #ff007f33 100%)",
    accent: "#00f0ff",
    watermark: "18",
    kicker: "Verified 18+",
  },
  milf: {
    background:
      "linear-gradient(135deg, #2a1038 0%, #c026d3 45%, #1c0a24 100%)",
    accent: "#e879f9",
    watermark: "M",
    kicker: "Mature & MILF",
  },
  petite: {
    background:
      "linear-gradient(145deg, #1a0d2e 0%, #ff007f 38%, #312e81 100%)",
    accent: "#fda4af",
    watermark: "P",
    kicker: "Petite & e-girl",
  },
  cosplay: {
    background:
      "linear-gradient(135deg, #1e1b4b 0%, #7c3aed 40%, #ff007f 100%)",
    accent: "#a78bfa",
    watermark: "✦",
    kicker: "Cosplay & fantasy",
  },
  couples: {
    background:
      "linear-gradient(145deg, #0f172a 0%, #ff007f 50%, #0b0f19 100%)",
    accent: "#fb7185",
    watermark: "2",
    kicker: "Duo shows",
  },
  trans: {
    background:
      "linear-gradient(150deg, #042f2e 0%, #14b8a6 35%, #ff007f 95%)",
    accent: "#5eead4",
    watermark: "T",
    kicker: "Trans models live",
  },
  alt: {
    background:
      "linear-gradient(145deg, #0a0a0a 0%, #4c1d95 55%, #ff007f 100%)",
    accent: "#c084fc",
    watermark: "A",
    kicker: "Alt · goth · ink",
  },
};

const DEFAULT_THEME: ExploreCategoryVisualTheme =
  EXPLORE_CATEGORY_VISUAL_THEMES.latinas;

export function themeForCategorySlug(
  slug: string | undefined | null,
): ExploreCategoryVisualTheme {
  if (!slug) return DEFAULT_THEME;
  const key = slug.trim().toLowerCase() as ExploreCategorySlug;
  return EXPLORE_CATEGORY_VISUAL_THEMES[key] ?? DEFAULT_THEME;
}
