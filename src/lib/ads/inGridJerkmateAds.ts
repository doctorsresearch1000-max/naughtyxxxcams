import type { FeedPerformer } from "@/lib/feed/filterPerformers";

/** Insert one Jerkmate native card after every N performer cards (mobile / default). */
export const IN_GRID_JERKMATE_EVERY_N = 6;

/** Less frequent in-grid ads on large screens for catalog readability. */
export const IN_GRID_JERKMATE_DESKTOP_EVERY_N = 12;

export type GridPerformerItem = {
  kind: "performer";
  key: string;
  performer: FeedPerformer;
  performerIndex: number;
};

export type GridJerkmateAdItem = {
  kind: "jerkmate-ad";
  key: string;
  adSlotIndex: number;
};

export type GridWithAdsItem = GridPerformerItem | GridJerkmateAdItem;

export function buildGridWithJerkmateAds(
  performers: FeedPerformer[],
  options?: { keyPrefix?: string; everyN?: number },
): GridWithAdsItem[] {
  const prefix = options?.keyPrefix ?? "grid";
  const everyN = options?.everyN ?? IN_GRID_JERKMATE_EVERY_N;
  const items: GridWithAdsItem[] = [];
  let adSlotIndex = 0;

  performers.forEach((performer, performerIndex) => {
    items.push({
      kind: "performer",
      key: performer.feedKey,
      performer,
      performerIndex,
    });

    const count = performerIndex + 1;
    if (everyN > 0 && count > 0 && count % everyN === 0) {
      items.push({
        kind: "jerkmate-ad",
        key: `${prefix}-jm-ad-${adSlotIndex}`,
        adSlotIndex,
      });
      adSlotIndex += 1;
    }
  });

  return items;
}
