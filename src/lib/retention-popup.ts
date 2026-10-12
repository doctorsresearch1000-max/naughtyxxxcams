import { readAgeGateVerified } from "@/lib/compliance/ageGateStorage";

export const RETENTION_POPUP_DELAY_MS = 30_000;
export const RETENTION_POPUP_COOLDOWN_MS = 24 * 60 * 60 * 1000;

const LS_LAST_SHOWN_AT = "nx-retention-popup-last-shown-at";
const SS_DISMISSED = "nx-retention-popup-dismissed";
const SS_SHOWN = "nx-retention-popup-shown";

/** Home / primary landers — retention timer waits for age gate on these routes. */
export function isRetentionLandingPath(pathname: string): boolean {
  if (pathname === "/") return true;
  if (pathname === "/explore") return true;
  return false;
}

export function isTelegramInAppBrowser(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  if (/Telegram/i.test(ua)) return true;
  const initData = window.Telegram?.WebApp?.initData;
  return Boolean(initData?.trim());
}

function safeGetItem(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetItem(storage: Storage, key: string, value: string): void {
  try {
    storage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export function wasRetentionPopupDismissedThisSession(): boolean {
  if (typeof window === "undefined") return true;
  return safeGetItem(sessionStorage, SS_DISMISSED) === "1";
}

export function wasRetentionPopupShownThisSession(): boolean {
  if (typeof window === "undefined") return true;
  return safeGetItem(sessionStorage, SS_SHOWN) === "1";
}

export function isRetentionPopupInCooldown(): boolean {
  if (typeof window === "undefined") return true;
  const raw = safeGetItem(localStorage, LS_LAST_SHOWN_AT);
  if (!raw) return false;
  const last = Number(raw);
  if (!Number.isFinite(last)) return false;
  return Date.now() - last < RETENTION_POPUP_COOLDOWN_MS;
}

export function canShowRetentionPopup(): boolean {
  if (isTelegramInAppBrowser()) return false;
  if (wasRetentionPopupDismissedThisSession()) return false;
  if (wasRetentionPopupShownThisSession()) return false;
  if (isRetentionPopupInCooldown()) return false;
  return true;
}

export function markRetentionPopupShown(): void {
  if (typeof window === "undefined") return;
  safeSetItem(sessionStorage, SS_SHOWN, "1");
  safeSetItem(localStorage, LS_LAST_SHOWN_AT, String(Date.now()));
}

export function markRetentionPopupDismissed(): void {
  if (typeof window === "undefined") return;
  safeSetItem(sessionStorage, SS_DISMISSED, "1");
  if (!wasRetentionPopupShownThisSession()) {
    markRetentionPopupShown();
  }
}

/**
 * Whether the 30s active timer should accumulate (visible tab only).
 */
export function shouldAccumulateRetentionTime(pathname: string): boolean {
  if (isTelegramInAppBrowser()) return false;
  if (!canShowRetentionPopup()) return false;
  if (isRetentionLandingPath(pathname) && !readAgeGateVerified()) {
    return false;
  }
  return true;
}

type ActiveTimerOptions = {
  delayMs: number;
  shouldRun: () => boolean;
  onElapsed: () => void;
};

/**
 * Cumulative active time while the document is visible; pauses in background tabs.
 */
export function startRetentionActiveTimer({
  delayMs,
  shouldRun,
  onElapsed,
}: ActiveTimerOptions): () => void {
  let accumulatedMs = 0;
  let lastSampleAt = performance.now();
  let rafId = 0;
  let fired = false;

  const sample = () => {
    if (fired) return;

    const now = performance.now();
    const hidden = document.visibilityState !== "visible";

    if (!hidden && shouldRun()) {
      accumulatedMs += now - lastSampleAt;
      if (accumulatedMs >= delayMs) {
        fired = true;
        onElapsed();
        return;
      }
    }

    lastSampleAt = now;
    rafId = window.requestAnimationFrame(sample);
  };

  const resetAnchor = () => {
    lastSampleAt = performance.now();
  };

  document.addEventListener("visibilitychange", resetAnchor);
  window.addEventListener("focus", resetAnchor);
  window.addEventListener("blur", resetAnchor);

  rafId = window.requestAnimationFrame(sample);

  return () => {
    fired = true;
    window.cancelAnimationFrame(rafId);
    document.removeEventListener("visibilitychange", resetAnchor);
    window.removeEventListener("focus", resetAnchor);
    window.removeEventListener("blur", resetAnchor);
  };
}
