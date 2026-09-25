/** Naiad Pure hybrid client parent postMessage (`pure.js`). */

export const PURE_PLAYER_EVENT_DISCONNECTED = "SM_DISCONNECTED";

export type PureDisconnectData = {
  reason: string;
  performerid?: number;
};

export type PurePlayerDisconnectRecord = {
  feedKey: string;
  receivedAt: number;
  data: PureDisconnectData;
  /** Poster had not been dismissed when the signal arrived. */
  beforePosterDismissed: boolean;
};

const disconnectByFeedKey = new Map<string, PurePlayerDisconnectRecord>();

export function parsePurePlayerParentMessage(
  data: unknown,
): { name: string; data?: Record<string, unknown> } | null {
  if (!data || typeof data !== "object") return null;
  const record = data as { name?: unknown; data?: unknown };
  if (typeof record.name !== "string" || !record.name) return null;
  const payload =
    record.data && typeof record.data === "object"
      ? (record.data as Record<string, unknown>)
      : undefined;
  return { name: record.name, data: payload };
}

export function parsePureDisconnectData(
  payload?: Record<string, unknown>,
): PureDisconnectData | null {
  if (!payload) return null;
  const reason = payload.reason;
  if (reason === undefined || reason === null) return null;
  const performerid = payload.performerid;
  return {
    reason: String(reason),
    performerid:
      typeof performerid === "number" && Number.isFinite(performerid)
        ? performerid
        : undefined,
  };
}

export function recordPurePlayerDisconnect(
  feedKey: string,
  data: PureDisconnectData,
  options: { beforePosterDismissed: boolean },
): PurePlayerDisconnectRecord {
  const entry: PurePlayerDisconnectRecord = {
    feedKey,
    receivedAt: Date.now(),
    data,
    beforePosterDismissed: options.beforePosterDismissed,
  };
  disconnectByFeedKey.set(feedKey, entry);
  if (process.env.NODE_ENV !== "production") {
    console.debug("[feed] Pure SM_DISCONNECTED", entry);
  }
  return entry;
}

export function getPurePlayerDisconnect(
  feedKey: string,
): PurePlayerDisconnectRecord | null {
  return disconnectByFeedKey.get(feedKey) ?? null;
}

export function clearPurePlayerDisconnect(feedKey: string): void {
  disconnectByFeedKey.delete(feedKey);
}
