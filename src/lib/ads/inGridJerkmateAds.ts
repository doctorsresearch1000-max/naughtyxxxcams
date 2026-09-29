import type { FeedPerformer } from "@/lib/feed/filterPerformers";

/** Insert one Jerkmate native card after every N performer cards. */
export const IN_GRID_JERKMATE_EVERY_N = 6;

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
  options?: { keyPrefix?: string },
): GridWithAdsItem[] {
  const prefix = options?.keyPrefix ?? "grid";
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
    if (count > 0 && count % IN_GRID_JERKMATE_EVERY_N === 0) {
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
