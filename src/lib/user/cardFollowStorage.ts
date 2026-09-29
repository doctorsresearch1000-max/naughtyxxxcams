const FOLLOW_KEY_PREFIX = "nx-card-follow-";
const PROFILE_FAV_PREFIX = "nx-profile-fav-";

export function isCardFollowed(feedKey: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(`${FOLLOW_KEY_PREFIX}${feedKey}`) === "1";
  } catch {
    return false;
  }
}

export function setCardFollowed(feedKey: string, followed: boolean): void {
  try {
    localStorage.setItem(`${FOLLOW_KEY_PREFIX}${feedKey}`, followed ? "1" : "0");
  } catch {
    /* private mode */
  }
}

export function toggleCardFollow(feedKey: string): boolean {
  const next = !isCardFollowed(feedKey);
  setCardFollowed(feedKey, next);
  return next;
}

export function isProfileFavorited(profileSlug: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(`${PROFILE_FAV_PREFIX}${profileSlug}`) === "1";
  } catch {
    return false;
  }
}

export function setProfileFavorited(profileSlug: string, saved: boolean): void {
  try {
    localStorage.setItem(`${PROFILE_FAV_PREFIX}${profileSlug}`, saved ? "1" : "0");
    window.dispatchEvent(new CustomEvent("nx-favorites-update"));
  } catch {
    /* private mode */
  }
}

export function toggleProfileFavorite(profileSlug: string): boolean {
  const next = !isProfileFavorited(profileSlug);
  setProfileFavorited(profileSlug, next);
  return next;
}
