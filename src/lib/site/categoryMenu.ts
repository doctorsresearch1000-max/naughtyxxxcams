import { EXPLORE_CATALOG_MENU } from "@/lib/explore/exploreCatalog";
import { explorePathForCategorySlug } from "@/lib/explore/paths";

export type DrawerNavLink = {
  label: string;
  href: string;
  accent?: boolean;
  icon?: string;
};

export type DrawerAccordionSection = {
  id: string;
  label: string;
  links: DrawerNavLink[];
};

export function categoryPath(slug: string): string {
  return `/category/${slug.trim().toLowerCase()}`;
}

export const DRAWER_PRIMARY_LINKS: DrawerNavLink[] = [
  { label: "Home", href: "/", accent: true, icon: "home" },
  { label: "Female", href: categoryPath("female"), icon: "female" },
  { label: "Male", href: categoryPath("male"), icon: "male" },
  { label: "Couples", href: explorePathForCategorySlug("couples"), icon: "couples" },
  { label: "Trans", href: explorePathForCategorySlug("trans"), icon: "trans" },
];

function catalogLinks(
  matcher: (slug: string, label: string) => boolean,
  limit = 12,
): DrawerNavLink[] {
  return EXPLORE_CATALOG_MENU.filter((item) =>
    matcher(item.slug, item.label),
  )
    .slice(0, limit)
    .map((item) => ({
      label: item.label,
      href: categoryPath(item.slug),
    }));
}

export const DRAWER_ACCORDION_SECTIONS: DrawerAccordionSection[] = [
  {
    id: "camsite",
    label: "Camsite",
    links: [
      { label: "Streamate live", href: "/explore" },
      { label: "Trending now", href: categoryPath("trending") },
      { label: "Verified 18+", href: explorePathForCategorySlug("verified") },
    ],
  },
  {
    id: "age",
    label: "Age",
    links: catalogLinks((slug) => slug.startsWith("gc_")),
  },
  {
    id: "race",
    label: "Race",
    links: [
      ...catalogLinks((slug) =>
        ["latinas", "asian", "ebony", "white", "indian"].some((k) =>
          slug.includes(k),
        ),
      ),
      { label: "Latinas", href: explorePathForCategorySlug("latinas") },
    ],
  },
  {
    id: "bust",
    label: "Bust",
    links: catalogLinks((slug, label) =>
      /bust|boob|tit/i.test(`${slug} ${label}`),
    ),
  },
  {
    id: "figure",
    label: "Figure",
    links: [
      { label: "Petite", href: explorePathForCategorySlug("petite") },
      { label: "MILF", href: explorePathForCategorySlug("milf") },
      ...catalogLinks((slug, label) =>
        /curvy|bbw|athletic|skinny|petite|milf/i.test(`${slug} ${label}`),
      ),
    ],
  },
  {
    id: "hair",
    label: "Hair",
    links: catalogLinks((slug, label) =>
      /hair|blonde|brunette|redhead/i.test(`${slug} ${label}`),
    ),
  },
  {
    id: "location",
    label: "Location",
    links: catalogLinks((slug, label) =>
      /colombia|mexico|usa|europe|russia|ukraine|philippines/i.test(
        `${slug} ${label}`,
      ),
    ),
  },
  {
    id: "popular",
    label: "Popular Cams",
    links: [
      { label: "Booty", href: categoryPath("booty") },
      { label: "Boobs", href: categoryPath("boobs") },
      { label: "Latina", href: categoryPath("latina") },
      { label: "Teen 18+", href: categoryPath("teen") },
      { label: "Cosplay", href: explorePathForCategorySlug("cosplay") },
      { label: "Alt", href: explorePathForCategorySlug("alt") },
    ],
  },
];

/** Resolve `/category/[slug]` to an explore route or hub. */
export function resolveCategorySlugTarget(slug: string): string | null {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return null;

  const genderMap: Record<string, string> = {
    female: "/explore",
    male: "/explore?cat=male",
    couple: explorePathForCategorySlug("couples"),
    couples: explorePathForCategorySlug("couples"),
    trans: explorePathForCategorySlug("trans"),
    trending: "/explore?cat=trending",
  };
  if (genderMap[normalized]) return genderMap[normalized];

  const catalog = EXPLORE_CATALOG_MENU.find((item) => item.slug === normalized);
  if (catalog) {
    return categoryPath(normalized);
  }

  const exploreSlugs = new Set([
    "latinas",
    "verified",
    "milf",
    "petite",
    "cosplay",
    "couples",
    "trans",
    "alt",
  ]);
  if (exploreSlugs.has(normalized)) {
    return explorePathForCategorySlug(normalized);
  }

  return `/explore?cat=${encodeURIComponent(normalized)}`;
}
