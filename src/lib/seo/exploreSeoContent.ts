import type { ExploreCategoryConfig } from "@/lib/explore/categorySlugs";
import { pickVariant } from "@/lib/seo/seoVariants";

const DEFAULT_TITLE_VARIANTS = [
  "Live Nude Cams & Private VIP Rooms — Streamate HD Directory | NaughtyXXXCams",
  "Watch Live Adult Webcams — Exclusive Models & Free Chat Entry | NaughtyXXXCams",
  "HD Sex Cam Discovery — Verified Streamate Performers | NaughtyXXXCams",
] as const;

const DEFAULT_DESC_VARIANTS = [
  "Browse live nude cams, private VIP shows, and exclusive model galleries. Filter by category, open HD Streamate rooms, and save favorites on NaughtyXXXCams.",
  "High-intent adult webcam directory: trending live models, private chat entry, and photo packs on official performer profiles. Mobile-first on NaughtyXXXCams.",
  "Discover verified Streamate models for live sex chat, exclusive content, and private cam sessions — complementary discovery hub on NaughtyXXXCams.",
] as const;

const CATEGORY_TITLE_SUFFIX = [
  "Nude Live Cams & VIP Private Chat",
  "HD Webcam Shows & Exclusive Packs",
  "Adult Live Chat & Private Room Access",
] as const;

const CATEGORY_DESC_INTROS = [
  "Watch {label} models live on Streamate: nude cam streams, private VIP chat, and exclusive profile media.",
  "High-intent {label} webcam directory — HD live shows, private sessions, and free chat entry points.",
  "{label} live sex cams with verified traits, gallery previews, and authorized private room links.",
] as const;

export type ExploreSeoCopy = {
  title: string;
  description: string;
};

export function generateExploreSeoCopy(
  category: ExploreCategoryConfig | null,
): ExploreSeoCopy {
  if (!category) {
    const seed = "explore-default";
    return {
      title: pickVariant(seed, DEFAULT_TITLE_VARIANTS),
      description: pickVariant(seed, DEFAULT_DESC_VARIANTS),
    };
  }

  const seed = `explore-cat-${category.slug}`;
  const suffix = pickVariant(seed, CATEGORY_TITLE_SUFFIX);
  const intro = pickVariant(seed, CATEGORY_DESC_INTROS).replace(
    "{label}",
    category.label,
  );

  const title = `${category.label} ${suffix} — ${category.headline} | NaughtyXXXCams`;
  const description = `${intro} ${category.seoDescription} Official NaughtyXXXCams category hub (not affiliated with third-party directories).`;

  return {
    title: title.slice(0, 120),
    description: description.slice(0, 165),
  };
}
