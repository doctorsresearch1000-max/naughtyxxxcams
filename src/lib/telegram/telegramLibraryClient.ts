import type { TelegramUser } from "@/lib/auth/telegramSession";
import {
  readSyncToken,
  readTelegramUser,
  writeSyncToken,
} from "@/lib/auth/telegramSession";
import {
  readUserLibrary,
  writeUserLibrary,
  type UserLibrary,
  type SavedModelRef,
  type HistoryEntry,
  type Playlist,
} from "@/lib/user/userLibrary";

function mergeRecord(
  a: Record<string, SavedModelRef>,
  b: Record<string, SavedModelRef>,
): Record<string, SavedModelRef> {
  const out = { ...a };
  for (const [key, ref] of Object.entries(b)) {
    const prev = out[key];
    if (!prev || (ref.savedAt ?? 0) >= (prev.savedAt ?? 0)) {
      out[key] = ref;
    }
  }
  return out;
}

function mergePlaylists(a: Playlist[], b: Playlist[]): Playlist[] {
  const byId = new Map<string, Playlist>();
  for (const pl of [...a, ...b]) {
    const existing = byId.get(pl.id);
    if (!existing) {
      byId.set(pl.id, { ...pl, items: [...pl.items] });
      continue;
    }
    const items = [...existing.items];
    for (const item of pl.items) {
      if (!items.some((i) => i.feedKey === item.feedKey)) {
        items.unshift(item);
      }
    }
    byId.set(pl.id, {
      ...existing,
      name: existing.name || pl.name,
      items,
    });
  }
  return [...byId.values()].sort((x, y) => y.createdAt - x.createdAt);
}

function mergeHistory(a: HistoryEntry[], b: HistoryEntry[]): HistoryEntry[] {
  const seen = new Set<string>();
  const out: HistoryEntry[] = [];
  for (const entry of [...a, ...b]) {
    if (seen.has(entry.feedKey)) continue;
    seen.add(entry.feedKey);
    out.push(entry);
  }
  return out.slice(0, 80);
}

export function mergeUserLibraries(
  local: UserLibrary,
  remote: UserLibrary,
): UserLibrary {
  return {
    likes: mergeRecord(local.likes, remote.likes),
    bookmarks: mergeRecord(local.bookmarks, remote.bookmarks),
    following: mergeRecord(local.following ?? {}, remote.following ?? {}),
    history: mergeHistory(local.history, remote.history),
    playlists: mergePlaylists(local.playlists, remote.playlists),
  };
}

function authHeaders(): HeadersInit | null {
  const token = readSyncToken();
  if (!token) return null;
  return {
    "Content-Type": "application/json",
    "X-Telegram-Sync-Token": token,
  };
}

export async function pullTelegramLibrary(): Promise<UserLibrary | null> {
  const headers = authHeaders();
  if (!headers) return null;
  const res = await fetch("/api/telegram/library", { headers });
  if (!res.ok) return null;
  const json = (await res.json()) as { library?: UserLibrary };
  return json.library ?? null;
}

export async function pushTelegramLibrary(library: UserLibrary): Promise<boolean> {
  const headers = authHeaders();
  if (!headers) return false;
  const res = await fetch("/api/telegram/library", {
    method: "PUT",
    headers,
    body: JSON.stringify({ library }),
  });
  return res.ok;
}

let syncTimer: number | null = null;

export function scheduleTelegramLibraryPush(): void {
  if (typeof window === "undefined") return;
  if (!readTelegramUser() || !readSyncToken()) return;
  if (syncTimer) window.clearTimeout(syncTimer);
  syncTimer = window.setTimeout(() => {
    syncTimer = null;
    void pushTelegramLibrary(readUserLibrary());
  }, 800);
}

export async function syncTelegramLibraryAfterLogin(
  _user: TelegramUser,
): Promise<void> {
  const remote = await pullTelegramLibrary();
  if (!remote) {
    await pushTelegramLibrary(readUserLibrary());
    return;
  }
  const merged = mergeUserLibraries(readUserLibrary(), remote);
  writeUserLibrary(merged);
  await pushTelegramLibrary(merged);
}

if (typeof window !== "undefined") {
  window.addEventListener("nx-library-update", () => {
    scheduleTelegramLibraryPush();
  });
}

export function persistTelegramSyncToken(token: string | null): void {
  writeSyncToken(token);
}
