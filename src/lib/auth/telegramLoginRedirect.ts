import { getTelegramWidgetAuthUrl } from "@/lib/auth/telegramLoginReturn";
import { rememberTelegramLoginReturnPath } from "@/lib/auth/telegramLoginReturn";

/**
 * English-first login: skip embedded widget copy (often localized to browser locale).
 * Uses the same redirect callback as the official widget.
 */
export function startTelegramLoginRedirect(): void {
  if (typeof window === "undefined") return;
  rememberTelegramLoginReturnPath();
  window.location.assign(getTelegramWidgetAuthUrl());
}
