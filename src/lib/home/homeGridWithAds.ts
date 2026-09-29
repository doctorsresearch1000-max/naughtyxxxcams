import type { FeedPerformer } from "@/lib/feed/filterPerformers";

/** Home tab: one native ad card after every N performer cards. */
export const HOME_IN_FEED_AD_EVERY_N_CARDS = 10;

export type HomeGridPerformerItem = {
  kind: "performer";
  key: string;
  performer: FeedPerformer;
  /** Index among performer cards only (analytics / LCP). */
  performerIndex: number;
};

export type HomeGridAdItem = {
  kind: "jerkmate-ad";
  key: string;
  /** 0-based ad slot (10th card → 0, 20th → 1, …). */
  adSlotIndex: number;
};

export type HomeGridItem = HomeGridPerformerItem | HomeGridAdItem;

export function buildHomeGridItems(performers: FeedPerformer[]): HomeGridItem[] {
  const items: HomeGridItem[] = [];
  let adSlotIndex = 0;

  performers.forEach((performer, performerIndex) => {
    items.push({
      kind: "performer",
      key: performer.feedKey,
      performer,
      performerIndex,
    });

    const performerCount = performerIndex + 1;
    if (
      performerCount > 0 &&
      performerCount % HOME_IN_FEED_AD_EVERY_N_CARDS === 0
    ) {
      items.push({
        kind: "jerkmate-ad",
        key: `home-jm-ad-${adSlotIndex}`,
        adSlotIndex,
      });
      adSlotIndex += 1;
    }
  });

  return items;
}
