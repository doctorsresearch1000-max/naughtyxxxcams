import type { TelegramUser } from "@/lib/auth/telegramSession";

export type SavedModelRef = {
  feedKey: string;
  nameClean?: string;
  name?: string;
  posterUrl: string;
  profilePath?: string | null;
  savedAt?: number;
};

export type HistoryEntry = SavedModelRef & {
  action: "view" | "like" | "bookmark" | "follow";
};

const FAVORITES_COLLECTION = "Favorites";
const SAVED_COLLECTION = "Guardados";

export type Playlist = {
  id: string;
  name: string;
  createdAt: number;
  items: SavedModelRef[];
};

export type UserLibrary = {
  likes: Record<string, SavedModelRef>;
  bookmarks: Record<string, SavedModelRef>;
  following: Record<string, SavedModelRef>;
  history: HistoryEntry[];
  playlists: Playlist[];
};

const STORAGE_KEY = "nx-user-library-v1";
const MAX_HISTORY = 80;

function emptyLibrary(): UserLibrary {
  return { likes: {}, bookmarks: {}, following: {}, history: [], playlists: [] };
}

export function readUserLibrary(): UserLibrary {
  if (typeof window === "undefined") return emptyLibrary();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyLibrary();
    const parsed = JSON.parse(raw) as UserLibrary;
    return {
      likes: parsed.likes ?? {},
      bookmarks: parsed.bookmarks ?? {},
      following: parsed.following ?? {},
      history: Array.isArray(parsed.history) ? parsed.history : [],
      playlists: Array.isArray(parsed.playlists) ? parsed.playlists : [],
    };
  } catch {
    return emptyLibrary();
  }
}

export function writeUserLibrary(lib: UserLibrary): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lib));
    window.dispatchEvent(new CustomEvent("nx-library-update"));
  } catch {
    /* ignore */
  }
}

function pushHistory(lib: UserLibrary, entry: HistoryEntry): void {
  lib.history = [entry, ...lib.history.filter((h) => h.feedKey !== entry.feedKey)].slice(
    0,
    MAX_HISTORY,
  );
}

export function recordView(ref: SavedModelRef): void {
  const lib = readUserLibrary();
  pushHistory(lib, { ...ref, action: "view", savedAt: Date.now() });
  writeUserLibrary(lib);
}

export function toggleLike(ref: SavedModelRef): boolean {
  const lib = readUserLibrary();
  const liked = Boolean(lib.likes[ref.feedKey]);
  if (liked) {
    delete lib.likes[ref.feedKey];
  } else {
    lib.likes[ref.feedKey] = { ...ref, savedAt: Date.now() };
    pushHistory(lib, { ...ref, action: "like", savedAt: Date.now() });
  }
  writeUserLibrary(lib);
  return !liked;
}

export function isLiked(feedKey: string): boolean {
  return Boolean(readUserLibrary().likes[feedKey]);
}

export function toggleBookmark(ref: SavedModelRef): boolean {
  const lib = readUserLibrary();
  const saved = Boolean(lib.bookmarks[ref.feedKey]);
  const stamped = { ...ref, savedAt: Date.now() };
  if (saved) {
    delete lib.bookmarks[ref.feedKey];
    removeFromNamedPlaylist(lib, SAVED_COLLECTION, ref.feedKey);
  } else {
    lib.bookmarks[ref.feedKey] = stamped;
    const collection = ensureSavedPlaylist(lib);
    if (!collection.items.some((i) => i.feedKey === ref.feedKey)) {
      collection.items = [stamped, ...collection.items];
    }
    pushHistory(lib, { ...stamped, action: "bookmark" });
  }
  writeUserLibrary(lib);
  return !saved;
}

export function isBookmarked(feedKey: string): boolean {
  return Boolean(readUserLibrary().bookmarks[feedKey]);
}

export function createPlaylist(name: string): Playlist {
  const lib = readUserLibrary();
  const playlist: Playlist = {
    id: `pl-${Date.now()}`,
    name: name.trim() || "My playlist",
    createdAt: Date.now(),
    items: [],
  };
  lib.playlists = [playlist, ...lib.playlists];
  writeUserLibrary(lib);
  return playlist;
}

function ensureNamedPlaylist(lib: UserLibrary, name: string, idPrefix: string): Playlist {
  const existing = lib.playlists.find((p) => p.name === name);
  if (existing) return existing;
  const playlist: Playlist = {
    id: `${idPrefix}-${Date.now()}`,
    name,
    createdAt: Date.now(),
    items: [],
  };
  lib.playlists = [playlist, ...lib.playlists];
  return playlist;
}

function ensureFavoritesPlaylist(lib: UserLibrary): Playlist {
  return ensureNamedPlaylist(lib, FAVORITES_COLLECTION, "pl-favorites");
}

function ensureSavedPlaylist(lib: UserLibrary): Playlist {
  if (lib.playlists.length === 0) {
    return ensureNamedPlaylist(lib, SAVED_COLLECTION, "pl-saved");
  }
  const named = lib.playlists.find((p) => p.name === SAVED_COLLECTION);
  if (named) return named;
  return ensureNamedPlaylist(lib, SAVED_COLLECTION, "pl-saved");
}

function removeFromNamedPlaylist(
  lib: UserLibrary,
  name: string,
  feedKey: string,
): void {
  for (const pl of lib.playlists) {
    if (pl.name === name) {
      pl.items = pl.items.filter((i) => i.feedKey !== feedKey);
    }
  }
}

function removeFromFavorites(lib: UserLibrary, feedKey: string): void {
  removeFromNamedPlaylist(lib, FAVORITES_COLLECTION, feedKey);
}

export function isFollowing(feedKey: string): boolean {
  return Boolean(readUserLibrary().following[feedKey]);
}

export function toggleFollowing(ref: SavedModelRef): boolean {
  const lib = readUserLibrary();
  const active = Boolean(lib.following[ref.feedKey]);
  const stamped = { ...ref, savedAt: Date.now() };

  if (active) {
    delete lib.following[ref.feedKey];
    removeFromFavorites(lib, ref.feedKey);
  } else {
    lib.following[ref.feedKey] = stamped;
    const favorites = ensureFavoritesPlaylist(lib);
    if (!favorites.items.some((i) => i.feedKey === ref.feedKey)) {
      favorites.items = [stamped, ...favorites.items];
    }
    pushHistory(lib, { ...stamped, action: "follow" });
  }

  writeUserLibrary(lib);
  return !active;
}

export function addToPlaylist(playlistId: string, ref: SavedModelRef): void {
  const lib = readUserLibrary();
  const pl = lib.playlists.find((p) => p.id === playlistId);
  if (!pl) return;
  if (!pl.items.some((i) => i.feedKey === ref.feedKey)) {
    pl.items = [{ ...ref, savedAt: Date.now() }, ...pl.items];
  }
  writeUserLibrary(lib);
}

export function libraryRequiresTelegram(user: TelegramUser | null): boolean {
  return user == null;
}
