import type { CrackPerformer } from "@/lib/crackrevenue/api";
import { getPerformerKey, pickCoverUrl } from "@/lib/crackrevenue/api";
import { imageUrlBaseKey } from "@/lib/media/imageDedupe";
import { buildModelAffiliateUrl } from "@/lib/crackrevenue/affiliate";
import { fetchExploreMasterPool } from "@/lib/explore/fetchCategoryPerformers";
import {
  performerProfilePath,
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

const NEARBY_SEEDS: { label: string; fallbackImage: string }[] = [
  {
    label: "Angela",
    fallbackImage:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
  },
  {
    label: "Selena",
    fallbackImage:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
  },
  {
    label: "Gaia",
    fallbackImage:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150",
  },
  {
    label: "Violetta",
    fallbackImage:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
  },
  {
    label: "Zara",
    fallbackImage:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150",
  },
];

const LIVE_FOLLOWED_USERNAMES = ["Bonny_Brok", "BonnyBrok", "bonny_brok"];

const OFFLINE_USERNAMES = ["404hotfound", "404HotFound"];

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findPerformer(
  pool: CrackPerformer[],
  hints: string[],
): CrackPerformer | undefined {
  const keys = new Set(hints.map(normalizeKey).filter(Boolean));
  return pool.find((p) => {
    const candidates = [p.nameClean, p.name, p.itemId].filter(Boolean) as string[];
    return candidates.some((c) => keys.has(normalizeKey(c)));
  });
}

function findByLabel(pool: CrackPerformer[], label: string): CrackPerformer | undefined {
  const key = normalizeKey(label);
  return pool.find((p) => {
    const name = normalizeKey(p.nameClean || p.name || "");
    return name.includes(key) || key.includes(name.slice(0, 4));
  });
}

function performerImage(p: CrackPerformer): string {
  return pickCoverUrl(p) || "";
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
    pool = await fetchExploreMasterPool(2);
  } catch {
    pool = [];
  }

  const livePool = pool.filter((p) => p.live !== false);
  const usedPerformerKeys = new Set<string>();
  const usedImageBases = new Set<string>();

  const nearby: FollowingNearbyItem[] = NEARBY_SEEDS.map((seed) => {
    let match =
      findByLabel(
        livePool.filter((p) => !usedPerformerKeys.has(getPerformerKey(p))),
        seed.label,
      ) ?? null;

    if (!match) {
      match =
        livePool.find((p) => {
          const key = getPerformerKey(p);
          if (usedPerformerKeys.has(key)) return false;
          const img = performerImage(p);
          if (!img) return false;
          const base = imageUrlBaseKey(img);
          if (usedImageBases.has(base)) return false;
          return true;
        }) ?? null;
    }

    if (match) {
      usedPerformerKeys.add(getPerformerKey(match));
      const img = performerImage(match);
      if (img) usedImageBases.add(imageUrlBaseKey(img));
    }

    const performer = match ?? ({ name: seed.label } as CrackPerformer);
    const image = match ? performerImage(match) : seed.fallbackImage;
    if (!match) usedImageBases.add(imageUrlBaseKey(image));

    return {
      id: `nearby-${seed.label}`,
      label: seed.label,
      image,
      isLive: match?.live !== false,
      profilePath: match
        ? performerProfilePathFromPerformer(match)
        : performerProfilePath(seed.label),
      affiliateUrl: buildModelAffiliateUrl(performer),
    };
  });

  let liveCards: FollowingLiveCard[] = [];
  const bonny =
    findPerformer(pool, LIVE_FOLLOWED_USERNAMES) ??
    livePool.sort((a, b) => (b.systemScore ?? 0) - (a.systemScore ?? 0))[0];

  if (bonny) {
    liveCards = [
      {
        id: bonny.itemId || bonny.nameClean || "bonny",
        username: bonny.nameClean || bonny.name || "Bonny_Brok",
        image:
          performerImage(bonny) ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
        affiliateUrl: buildModelAffiliateUrl(bonny),
        profilePath: performerProfilePathFromPerformer(bonny),
      },
    ];
  } else {
    liveCards = [
      {
        id: "bonny-mock",
        username: "Bonny_Brok",
        image:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
        affiliateUrl: buildModelAffiliateUrl({ nameClean: "Bonny_Brok" }),
        profilePath: performerProfilePath("Bonny_Brok"),
      },
    ];
  }

  const offlineMatch = findPerformer(pool, OFFLINE_USERNAMES);
  const offline: FollowingOfflineItem[] = [
    {
      id: "offline-404",
      username: offlineMatch?.nameClean || offlineMatch?.name || "404hotfound",
      avatar:
        (offlineMatch && performerImage(offlineMatch)) ||
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100",
      profilePath: offlineMatch
        ? performerProfilePathFromPerformer(offlineMatch)
        : performerProfilePath("404hotfound"),
    },
  ];

  const followedTotal = liveCards.length + offline.length;

  return {
    nearby,
    liveCards,
    offline,
    liveCount: liveCards.length,
    followedTotal,
  };
}
