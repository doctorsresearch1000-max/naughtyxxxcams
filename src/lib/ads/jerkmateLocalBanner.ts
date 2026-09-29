import { pickJerkmateGridCreative } from "@/lib/ads/jerkmateGridCreatives";

/** Wide / natural banners — local creatives only (avoids broken CDN error pages in feed). */
export function pickJerkmateNaturalBannerSrc(slot = 0): string {
  return pickJerkmateGridCreative(slot + 3);
}
