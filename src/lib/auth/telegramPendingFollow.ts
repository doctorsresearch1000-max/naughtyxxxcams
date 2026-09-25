import type { SavedModelRef } from "@/lib/user/userLibrary";
import { isFollowing, toggleFollowing } from "@/lib/user/userLibrary";

const STORAGE_KEY = "nx-tg-pending-follow-v1";

export function stashPendingFollow(modelRef: SavedModelRef): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(modelRef));
  } catch {
    /* ignore */
  }
}

export function clearPendingFollow(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function consumePendingFollow(): SavedModelRef | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    if (!raw) return null;
    const ref = JSON.parse(raw) as SavedModelRef;
    if (!ref?.feedKey) return null;
    return ref;
  } catch {
    return null;
  }
}

/** Run follow saved before redirect login, if user is not already following. */
export function applyPendingFollowIfAny(): boolean {
  const ref = consumePendingFollow();
  if (!ref) return false;
  if (!isFollowing(ref.feedKey)) {
    toggleFollowing(ref);
  }
  return true;
}
