import {
  CRACKREVENUE_API_KEY,
  CRACKREVENUE_TOKEN,
  CRACKREVENUE_USER_AGENT,
  STREAMATE_BRAND,
} from "./config";

const API_BASE = "https://performersext-api.pcvdaa.com/performers-ext";
const FETCH_TIMEOUT_MS = 6_000;

export type CrackPerformer = {
  name?: string;
  nameClean?: string;
  itemId?: string;
  live?: boolean;
  thumbnailUrl?: string;
  liveSnapshotURL?: string;
  roomUrl?: string;
  iframeFeedURL?: string;
  systemScore?: number;
  characteristicsTags?: string[];
  autoTags?: string[];
  customTags?: string[];
  characteristic?: {
    ethnicities?: string[];
    country?: string;
    languages?: string[];
    age?: number;
    bodyTypes?: string[];
    bustSize?: string;
    height?: string;
    hairColor?: string;
    eyeColor?: string;
    gender?: string;
  };
  stars?: number;
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

const EMPTY_RESPONSE: PerformersResponse = { count: 0, performers: [] };

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
): Promise<Response | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

function normalizePerformersResponse(
  payload: unknown,
): PerformersResponse {
  if (!payload || typeof payload !== "object") {
    return EMPTY_RESPONSE;
  }

  const data = payload as PerformersResponse;
  const performers = Array.isArray(data.performers) ? data.performers : [];
  const count =
    typeof data.count === "number" && Number.isFinite(data.count)
      ? data.count
      : performers.length;

  return { count, performers };
}

export async function fetchStreamatePerformers(
  params: FetchPerformersParams = {},
): Promise<PerformersResponse> {
  try {
    const search = new URLSearchParams({
      token: CRACKREVENUE_TOKEN,
      brands: STREAMATE_BRAND,
      gender: "f",
      live: String(params.live ?? true),
      page: String(params.page ?? 1),
      size: String(Math.min(params.size ?? 12, 100)),
      sorting: "score",
      lang: "es",
    });

    if (params.tags) search.set("tags", params.tags);
    if (params.ethnicities) search.set("ethnicities", params.ethnicities);
    if (params.ages) search.set("ages", params.ages);

    const res = await fetchWithTimeout(`${API_BASE}?${search.toString()}`, {
      headers: {
        "x-api-key": CRACKREVENUE_API_KEY,
        "User-Agent": CRACKREVENUE_USER_AGENT,
      },
      cache: "no-store",
    });

    if (!res || !res.ok) {
      return EMPTY_RESPONSE;
    }

    const json = (await res.json().catch(() => null)) as unknown;
    return normalizePerformersResponse(json);
  } catch {
    return EMPTY_RESPONSE;
  }
}

export function pickCoverUrl(performer?: CrackPerformer | null): string | null {
  if (!performer) return null;
  const snapshot = performer.liveSnapshotURL;
  const thumb = performer.thumbnailUrl;
  if (typeof snapshot === "string" && snapshot.length > 0) return snapshot;
  if (typeof thumb === "string" && thumb.length > 0) return thumb;
  return null;
}

/** Banner ancho de perfil (prioriza snapshot en vivo). */
export function pickProfileBannerUrl(
  performer?: CrackPerformer | null,
): string | null {
  if (!performer) return null;
  const snap = performer.liveSnapshotURL?.trim();
  const thumb = performer.thumbnailUrl?.trim();
  if (snap) return snap;
  if (thumb) return thumb;
  return pickCoverUrl(performer);
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
