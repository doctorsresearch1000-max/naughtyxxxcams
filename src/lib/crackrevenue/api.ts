import {
  CRACKREVENUE_API_KEY,
  CRACKREVENUE_TOKEN,
  CRACKREVENUE_USER_AGENT,
  STREAMATE_BRAND,
} from "./config";

const API_BASE = "https://performersext-api.pcvdaa.com/performers-ext";

export type CrackPerformer = {
  name?: string;
  nameClean?: string;
  itemId?: string;
  live?: boolean;
  thumbnailUrl?: string;
  liveSnapshotURL?: string;
  systemScore?: number;
  characteristicsTags?: string[];
  autoTags?: string[];
  customTags?: string[];
  characteristic?: {
    ethnicities?: string[];
  };
};

export type PerformersResponse = {
  count?: number;
  performers?: CrackPerformer[];
};

type FetchPerformersParams = {
  page?: number;
  size?: number;
  tags?: string;
  ethnicities?: string;
  ages?: string;
  live?: boolean;
};

export async function fetchStreamatePerformers(
  params: FetchPerformersParams = {},
): Promise<PerformersResponse> {
  const search = new URLSearchParams({
    token: CRACKREVENUE_TOKEN,
    brands: STREAMATE_BRAND,
    gender: "f",
    live: String(params.live ?? true),
    page: String(params.page ?? 1),
    size: String(params.size ?? 12),
    sorting: "score",
    lang: "es",
  });

  if (params.tags) search.set("tags", params.tags);
  if (params.ethnicities) search.set("ethnicities", params.ethnicities);
  if (params.ages) search.set("ages", params.ages);

  const res = await fetch(`${API_BASE}?${search.toString()}`, {
    headers: {
      "x-api-key": CRACKREVENUE_API_KEY,
      "User-Agent": CRACKREVENUE_USER_AGENT,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return { count: 0, performers: [] };
  }

  return (await res.json()) as PerformersResponse;
}

export function pickCoverUrl(performer?: CrackPerformer): string | null {
  if (!performer) return null;
  return performer.liveSnapshotURL || performer.thumbnailUrl || null;
}

export function getPerformerKey(performer: CrackPerformer): string {
  return (
    performer.itemId ||
    performer.nameClean ||
    performer.name ||
    pickCoverUrl(performer) ||
    "unknown"
  );
}
