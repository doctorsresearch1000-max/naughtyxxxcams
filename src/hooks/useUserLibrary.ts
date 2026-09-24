"use client";

import { useCallback, useEffect, useState } from "react";
import {
  readUserLibrary,
  type HistoryEntry,
  type Playlist,
  type SavedModelRef,
  type UserLibrary,
} from "@/lib/user/userLibrary";

export function useUserLibrary() {
  const [library, setLibrary] = useState<UserLibrary>(() => readUserLibrary());

  const refresh = useCallback(() => {
    setLibrary(readUserLibrary());
  }, []);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener("nx-library-update", onUpdate);
    return () => window.removeEventListener("nx-library-update", onUpdate);
  }, [refresh]);

  return { library, refresh };
}

export function useLikedModels(): SavedModelRef[] {
  const { library } = useUserLibrary();
  return Object.values(library.likes).sort(
    (a, b) => (b.savedAt ?? 0) - (a.savedAt ?? 0),
  );
}

export function useBookmarkedModels(): SavedModelRef[] {
  const { library } = useUserLibrary();
  return Object.values(library.bookmarks).sort(
    (a, b) => (b.savedAt ?? 0) - (a.savedAt ?? 0),
  );
}

export function useHistoryEntries(): HistoryEntry[] {
  const { library } = useUserLibrary();
  return library.history;
}

export function usePlaylists(): Playlist[] {
  const { library } = useUserLibrary();
  return library.playlists;
}

export function useFollowingModels(): SavedModelRef[] {
  const { library } = useUserLibrary();
  return Object.values(library.following ?? {}).sort(
    (a, b) => (b.savedAt ?? 0) - (a.savedAt ?? 0),
  );
}
