/** Rotating in-grid Jerkmate copy (Home native tube cards). */

export type JerkmateHomeAdCopy = {
  brandLine: string;
  ctaLine: string;
  heroLine: string;
};

export const JERKMATE_HOME_AD_VARIANTS: readonly JerkmateHomeAdCopy[] = [
  {
    brandLine: "Jerkmate",
    ctaLine: "Join free",
    heroLine: "Free live cams",
  },
  {
    brandLine: "Jerkmate",
    ctaLine: "Jerkmate models",
    heroLine: "Top models online",
  },
  {
    brandLine: "Jerkmate",
    ctaLine: "Jerk with Jerkmate models",
    heroLine: "FREE PROMO",
  },
  {
    brandLine: "Jerkmate",
    ctaLine: "Join free",
    heroLine: "Limited free pass",
  },
  {
    brandLine: "Jerkmate",
    ctaLine: "Jerkmate models",
    heroLine: "HD chat & cams",
  },
] as const;

export function pickJerkmateHomeAdCopy(adSlotIndex: number): JerkmateHomeAdCopy {
  const variants = JERKMATE_HOME_AD_VARIANTS;
  const idx =
    ((adSlotIndex % variants.length) + variants.length) % variants.length;
  return variants[idx]!;
}
