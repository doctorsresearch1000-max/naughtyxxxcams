import {
  API_AGE_SLUGS,
  API_ETHNICITY_SLUGS,
  API_TAG_SLUGS,
} from "@/lib/crackrevenue/config";
import {
  EXPLORE_CATEGORY_MAP,
  EXPLORE_CATEGORY_SLUGS,
  type ExploreCategoryConfig,
} from "@/lib/explore/categorySlugs";

const AGE_LABELS: Record<string, string> = {
  gc_18_19: "18-19",
  gc_20_29: "20-29",
  gc_30_39: "30-39",
  gc_40_49: "40-49",
  gc_50_plus: "50+",
};

export type ExploreCatalogMenuItem = {
  slug: string;
  label: string;
  config: ExploreCategoryConfig;
};

function formatTagLabel(value: string): string {
  return value
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function slugFromApiValue(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

function tagConfig(tag: string): ExploreCategoryConfig {
  const slug = slugFromApiValue(tag);
  return {
    slug,
    label: formatTagLabel(tag),
    headline: `${formatTagLabel(tag)} live`,
    seoTitle: `${formatTagLabel(tag)} Live Cams | NaughtyXXXCams`,
    seoDescription: `Browse live ${tag} models on NaughtyXXXCams.`,
    api: { tags: tag },
  };
}

function ethnicityConfig(value: string): ExploreCategoryConfig {
  const slug = slugFromApiValue(value);
  return {
    slug,
    label: formatTagLabel(value),
    headline: `${formatTagLabel(value)} models`,
    seoTitle: `${formatTagLabel(value)} Live Cams | NaughtyXXXCams`,
    seoDescription: `Live ${value} performers streaming now.`,
    api: { ethnicities: value },
  };
}

function ageConfig(value: string): ExploreCategoryConfig {
  const slug = value.toLowerCase();
  const label = AGE_LABELS[value] ?? value.replace("gc_", "").replace("_", "-");
  return {
    slug,
    label,
    headline: `Ages ${label}`,
    seoTitle: `${label} Live Cams | NaughtyXXXCams`,
    seoDescription: `Models aged ${label} streaming live.`,
    api: { ages: value },
  };
}

function buildExploreCatalogMenu(): ExploreCatalogMenuItem[] {
  const items: ExploreCatalogMenuItem[] = [];
  const seenSlugs = new Set<string>();

  const push = (config: ExploreCategoryConfig) => {
    const slug = config.slug.toLowerCase();
    if (seenSlugs.has(slug)) return;
    seenSlugs.add(slug);
    items.push({ slug, label: config.label, config });
  };

  for (const slug of EXPLORE_CATEGORY_SLUGS) {
    push(EXPLORE_CATEGORY_MAP[slug]);
  }

  for (const tag of API_TAG_SLUGS) {
    push(tagConfig(tag));
  }

  for (const ethnicity of API_ETHNICITY_SLUGS) {
    push(ethnicityConfig(ethnicity));
  }

  for (const age of API_AGE_SLUGS) {
    push(ageConfig(age));
  }

  return items;
}

export const EXPLORE_CATALOG_MENU: ExploreCatalogMenuItem[] =
  buildExploreCatalogMenu();

const CATALOG_BY_SLUG = new Map<string, ExploreCategoryConfig>(
  EXPLORE_CATALOG_MENU.map((item) => [item.slug, item.config]),
);

export function isExploreCatalogSlug(
  value: string | undefined | null,
): boolean {
  if (!value) return false;
  return CATALOG_BY_SLUG.has(value.trim().toLowerCase());
}

export function resolveExploreCatalogCategory(
  catParam?: string | null,
): ExploreCategoryConfig | null {
  if (!catParam?.trim()) return null;
  return CATALOG_BY_SLUG.get(catParam.trim().toLowerCase()) ?? null;
}

/** SEO + full API catalog slugs. */
export function resolveExploreCategory(
  catParam?: string | null,
): ExploreCategoryConfig | null {
  return resolveExploreCatalogCategory(catParam);
}
