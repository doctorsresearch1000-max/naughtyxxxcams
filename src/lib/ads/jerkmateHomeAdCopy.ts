/** Rotating in-grid Jerkmate copy for Home (tube card footer lines). */

export type JerkmateHomeAdCopy = {
  brandLine: string;
  ctaLine: string;
  subtitle: string;
};

export const JERKMATE_HOME_AD_VARIANTS: readonly JerkmateHomeAdCopy[] = [
  {
    brandLine: "Jerkmate",
    ctaLine: "Jerkmate free",
    subtitle: "Top live models tonight",
  },
  {
    brandLine: "Jerkmate",
    ctaLine: "Join free",
    subtitle: "Free pass — limited slots",
  },
  {
    brandLine: "Jerkmate",
    ctaLine: "Watch live now",
    subtitle: "HD cams & instant chat",
  },
  {
    brandLine: "Jerkmate",
    ctaLine: "Jerk off with Jerkmate models",
    subtitle: "Private & public shows",
  },
  {
    brandLine: "Jerkmate",
    ctaLine: "Claim free access",
    subtitle: "Partner offer — 18+ only",
  },
  {
    brandLine: "Jerkmate",
    ctaLine: "Try Jerkmate live",
    subtitle: "New models every hour",
  },
] as const;

export function pickJerkmateHomeAdCopy(adSlotIndex: number): JerkmateHomeAdCopy {
  const variants = JERKMATE_HOME_AD_VARIANTS;
  const idx =
    ((adSlotIndex % variants.length) + variants.length) % variants.length;
  return variants[idx]!;
}
