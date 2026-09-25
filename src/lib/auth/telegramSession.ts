export type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
};

const STORAGE_KEY = "nx-telegram-session-v1";
const SYNC_TOKEN_KEY = "nx-telegram-sync-v1";

export function readTelegramUser(): TelegramUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TelegramUser;
    if (!parsed?.id || !parsed.first_name) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeTelegramUser(user: TelegramUser | null): void {
  if (typeof window === "undefined") return;
  try {
    if (!user) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SYNC_TOKEN_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
    window.dispatchEvent(new CustomEvent("nx-telegram-auth"));
  } catch {
    /* ignore */
  }
}

export function isTelegramAuthenticated(): boolean {
  return readTelegramUser() != null;
}

export function readSyncToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(SYNC_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function writeSyncToken(token: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (!token) localStorage.removeItem(SYNC_TOKEN_KEY);
    else localStorage.setItem(SYNC_TOKEN_KEY, token);
  } catch {
    /* ignore */
  }
}
