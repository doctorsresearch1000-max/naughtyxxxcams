export type ContinueWatchingEntry = {
  feedKey: string;
  nameClean?: string;
  name?: string;
  posterUrl: string;
  watchedAt: number;
};

const STORAGE_KEY = "nx-continue-watching-v1";

export function saveContinueWatching(entry: Omit<ContinueWatchingEntry, "watchedAt">): void {
  if (typeof window === "undefined") return;
  if (!entry.feedKey?.trim() || !entry.posterUrl?.trim()) return;

  const payload: ContinueWatchingEntry = {
    ...entry,
    watchedAt: Date.now(),
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* quota / private mode */
  }
}

export function readContinueWatching(): ContinueWatchingEntry | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ContinueWatchingEntry;
    if (!parsed?.feedKey || !parsed.posterUrl) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function formatLastWatchedLabel(watchedAt: number): string {
  const sec = Math.max(0, Math.floor((Date.now() - watchedAt) / 1000));
  if (sec < 60) return `${sec} second${sec === 1 ? "" : "s"} ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? "" : "s"} ago`;
  return `${Math.floor(hr / 24)} day${Math.floor(hr / 24) === 1 ? "" : "s"} ago`;
}

export const RESUME_FEED_QUERY = "resume";
