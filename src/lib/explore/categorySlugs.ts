export type CategoryApiFilter = {
  tags?: string;
  ethnicities?: string;
  ages?: string;
};

export const EXPLORE_CATEGORY_SLUGS = [
  "latinas",
  "verified",
  "milf",
  "petite",
  "cosplay",
  "couples",
  "trans",
  "alt",
] as const;

export type ExploreCategorySlug = (typeof EXPLORE_CATEGORY_SLUGS)[number];

export type ExploreCategoryConfig = {
  slug: ExploreCategorySlug;
  label: string;
  headline: string;
  seoTitle: string;
  seoDescription: string;
  api: CategoryApiFilter;
  clientMatch?: string[];
};

export const EXPLORE_CATEGORY_MAP: Record<ExploreCategorySlug, ExploreCategoryConfig> =
  {
    latinas: {
      slug: "latinas",
      label: "Latinas",
      headline: "Latina models live",
      seoTitle: "Latina Live Cams — Hispanic Streamate Models | NaughtyXXXCams",
      seoDescription:
        "Browse verified Latina models in HD on Streamate. Filter by category, join live rooms, and save favorites on NaughtyXXXCams.",
      api: { ethnicities: "hispanic" },
    },
    verified: {
      slug: "verified",
      label: "18+ Verified",
      headline: "Verified 18+ models",
      seoTitle: "Verified 18+ Live Cams — HD Webcams | NaughtyXXXCams",
      seoDescription:
        "Directory of verified adult models 18+. Live streams, official profiles, and alerts when your favorite goes online.",
      api: {},
      clientMatch: ["gc_18_19", "gc_20_29", "young", "verified"],
    },
    milf: {
      slug: "milf",
      label: "MILF",
      headline: "MILF & mature cams",
      seoTitle: "MILF & Mature Live Cams — Streamate HD | NaughtyXXXCams",
      seoDescription:
        "Top MILF and mature models streaming live. Chat, private shows, and SEO profiles with gallery and traits.",
      api: { tags: "milf" },
    },
    petite: {
      slug: "petite",
      label: "Petite",
      headline: "Petite & e-girl models",
      seoTitle: "Petite Live Cams — E-girls on Streamate | NaughtyXXXCams",
      seoDescription:
        "Discover petite models and e-girls in HD. Fast scroll, unique profiles, and direct links to live rooms.",
      api: { tags: "petite" },
      clientMatch: ["skinny", "petite"],
    },
    cosplay: {
      slug: "cosplay",
      label: "Cosplay",
      headline: "Cosplay streamers",
      seoTitle: "Cosplay Live Cams — Roleplay & Fantasy | NaughtyXXXCams",
      seoDescription:
        "Cosplay aesthetics, costumes, and roleplay live. Filter by category and join chat in seconds.",
      api: { tags: "dancing" },
      clientMatch: ["cosplay", "costume", "roleplay", "anime"],
    },
    couples: {
      slug: "couples",
      label: "Couples",
      headline: "Couple cams",
      seoTitle: "Couple Live Cams — Duo Shows | NaughtyXXXCams",
      seoDescription:
        "Couples and duos streaming live. Explore shared shows, interactive chat, and verified profiles.",
      api: { tags: "kinky" },
      clientMatch: ["couple", "couples", "duo", "pair"],
    },
    trans: {
      slug: "trans",
      label: "Trans",
      headline: "Trans models",
      seoTitle: "Trans Live Cams — HD Webcams | NaughtyXXXCams",
      seoDescription:
        "Trans models live with structured profiles, tags, and authorized Streamate room links.",
      api: { tags: "beautiful" },
      clientMatch: ["trans", "tgirl", "ts"],
    },
    alt: {
      slug: "alt",
      label: "Alt & Goth",
      headline: "Alt & goth models",
      seoTitle: "Alt & Goth Live Cams — Tattoo & Kinky | NaughtyXXXCams",
      seoDescription:
        "Alternative, goth, tattoo, and kinky vibes on cam. Filter alt models and go live instantly.",
      api: { tags: "tattoos" },
      clientMatch: ["goth", "alt", "tattoo", "piercing", "emo"],
    },
  };

const SLUG_SET = new Set<string>(EXPLORE_CATEGORY_SLUGS);

export function isExploreCategorySlug(
  value: string | undefined | null,
): value is ExploreCategorySlug {
  if (!value) return false;
  return SLUG_SET.has(value.toLowerCase());
}

export function resolveExploreCategory(
  catParam?: string | null,
): ExploreCategoryConfig | null {
  if (!catParam) return null;
  const key = catParam.toLowerCase();
  if (!isExploreCategorySlug(key)) return null;
  return EXPLORE_CATEGORY_MAP[key];
}

export function getDefaultExploreSeo() {
  return {
    title: "Discover Live Models — Streamate HD | NaughtyXXXCams",
    description:
      "Trending live models, category filters, and mobile-optimized streams on NaughtyXXXCams.",
    headline: "Discover",
    subline: "Find rooms that match your favorite category",
  };
}
