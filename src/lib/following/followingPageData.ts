import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { getPerformerKey, pickCoverUrl } from "@/lib/crackrevenue/api";
import { imageUrlBaseKey } from "@/lib/media/imageDedupe";
import { buildModelAffiliateUrl } from "@/lib/crackrevenue/affiliate";
import { fetchExploreMasterPool } from "@/lib/explore/fetchCategoryPerformers";
import {
  performerProfilePathFromPerformer,
} from "@/lib/profile/performerHandle";

export type FollowingNearbyItem = {
  id: string;
  label: string;
  image: string;
  isLive: boolean;
  profilePath: string | null;
  affiliateUrl: string;
};

export type FollowingLiveCard = {
  id: string;
  username: string;
  image: string;
  affiliateUrl: string;
  profilePath: string | null;
};

export type FollowingOfflineItem = {
  id: string;
  username: string;
  avatar: string;
  profilePath: string | null;
};

const NEARBY_STORY_COUNT = 18;
const LIVE_CARD_COUNT = 6;
const OFFLINE_COUNT = 8;

function performerImage(p: CrackPerformer): string {
  return pickCoverUrl(p) || "";
}

function storyLabel(p: CrackPerformer): string {
  const raw = p.nameClean || p.name || "Model";
  const first = raw.split(/[_\s-]+/)[0] ?? raw;
  return first.length > 12 ? `${first.slice(0, 11)}…` : first;
}

function takeUniquePerformers(
  pool: CrackPerformer[],
  limit: number,
  usedPerformerKeys: Set<string>,
  usedImageBases: Set<string>,
): CrackPerformer[] {
  const out: CrackPerformer[] = [];
  for (const p of pool) {
    if (out.length >= limit) break;
    const key = getPerformerKey(p);
    if (usedPerformerKeys.has(key)) continue;
    const img = performerImage(p);
    if (!img) continue;
    const base = imageUrlBaseKey(img);
    if (usedImageBases.has(base)) continue;
    usedPerformerKeys.add(key);
    usedImageBases.add(base);
    out.push(p);
  }
  return out;
}

export type FollowingPageData = {
  nearby: FollowingNearbyItem[];
  liveCards: FollowingLiveCard[];
  offline: FollowingOfflineItem[];
  liveCount: number;
  followedTotal: number;
};

export async function getFollowingPageData(): Promise<FollowingPageData> {
  let pool: CrackPerformer[] = [];
  try {
    pool = await fetchExploreMasterPool(3);
  } catch {
    pool = [];
  }

  const livePool = pool
    .filter((p) => p.live !== false)
    .sort((a, b) => (b.systemScore ?? 0) - (a.systemScore ?? 0));
  const offlinePool = pool
    .filter((p) => p.live === false)
    .sort((a, b) => (b.systemScore ?? 0) - (a.systemScore ?? 0));

  const usedPerformerKeys = new Set<string>();
  const usedImageBases = new Set<string>();

  const nearbyPerformers = takeUniquePerformers(
    livePool,
    NEARBY_STORY_COUNT,
    usedPerformerKeys,
    usedImageBases,
  );

  const nearby: FollowingNearbyItem[] = nearbyPerformers.map((match) => ({
    id: `nearby-${getPerformerKey(match)}`,
    label: storyLabel(match),
    image: performerImage(match),
    isLive: true,
    profilePath: performerProfilePathFromPerformer(match),
    affiliateUrl: buildModelAffiliateUrl(match),
  }));

  const livePerformers = takeUniquePerformers(
    livePool,
    LIVE_CARD_COUNT,
    usedPerformerKeys,
    usedImageBases,
  );

  const liveCards: FollowingLiveCard[] = livePerformers.map((p) => ({
    id: getPerformerKey(p),
    username: p.nameClean || p.name || "Model",
    image: performerImage(p),
    affiliateUrl: buildModelAffiliateUrl(p),
    profilePath: performerProfilePathFromPerformer(p),
  }));

  const offlineSource =
    offlinePool.length > 0 ? offlinePool : pool.filter((p) => p.live === false);

  const offlinePerformers = takeUniquePerformers(
    offlineSource,
    OFFLINE_COUNT,
    usedPerformerKeys,
    usedImageBases,
  );

  const offline: FollowingOfflineItem[] = offlinePerformers.map((p) => ({
    id: `offline-${getPerformerKey(p)}`,
    username: p.nameClean || p.name || "Model",
    avatar: performerImage(p),
    profilePath: performerProfilePathFromPerformer(p),
  }));

  const followedTotal = liveCards.length + offline.length;

  return {
    nearby,
    liveCards,
    offline,
    liveCount: liveCards.length,
    followedTotal,
  };
}
