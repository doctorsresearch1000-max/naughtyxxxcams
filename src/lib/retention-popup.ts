import { readAgeGateVerified } from "@/lib/compliance/ageGateStorage";

export const RETENTION_POPUP_DELAY_MS = 30_000;

/** Once per browser tab session — cleared when the tab/window session ends. */
export const NAUGHTY_POPUP_SHOWN_SESSION_KEY = "naughty_popup_shown";

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

function safeGetSessionItem(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetSessionItem(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export function wasRetentionPopupShownThisSession(): boolean {
  return (
    safeGetSessionItem(NAUGHTY_POPUP_SHOWN_SESSION_KEY) === "true"
  );
}

/** @deprecated Use {@link wasRetentionPopupShownThisSession} — dismiss shares the same session flag. */
export function wasRetentionPopupDismissedThisSession(): boolean {
  return wasRetentionPopupShownThisSession();
}

export function canShowRetentionPopup(): boolean {
  if (isTelegramInAppBrowser()) return false;
  if (wasRetentionPopupShownThisSession()) return false;
  return true;
}

export function markRetentionPopupShown(): void {
  safeSetSessionItem(NAUGHTY_POPUP_SHOWN_SESSION_KEY, "true");
}

/** Closing the modal or navigating away after show — no second display this session. */
export function markRetentionPopupDismissed(): void {
  markRetentionPopupShown();
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
