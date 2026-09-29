import {
  buildGridWithJerkmateAds,
  type GridWithAdsItem,
} from "@/lib/ads/inGridJerkmateAds";

export { IN_GRID_JERKMATE_EVERY_N as HOME_IN_FEED_AD_EVERY_N_CARDS } from "@/lib/ads/inGridJerkmateAds";

export type HomeGridItem = GridWithAdsItem;

export function buildHomeGridItems(
  performers: Parameters<typeof buildGridWithJerkmateAds>[0],
): HomeGridItem[] {
  return buildGridWithJerkmateAds(performers, { keyPrefix: "home" });
}
