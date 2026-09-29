import { rememberTelegramLoginReturnPath } from "@/lib/auth/telegramLoginReturn";

/**
 * Redirect auth must go through the official Telegram Login Widget (iframe).
 * Navigating to /auth/telegram without query params always fails verification.
 */
export function prepareTelegramLoginAttempt(): void {
  if (typeof window === "undefined") return;
  rememberTelegramLoginReturnPath();
}
