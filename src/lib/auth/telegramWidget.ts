import type { TelegramWidgetAuthPayload } from "@/lib/auth/verifyTelegram";
import {
  getTelegramWidgetAuthUrl,
  rememberTelegramLoginReturnPath,
} from "@/lib/auth/telegramLoginReturn";

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramWidgetAuthPayload) => void;
  }
}

export type MountTelegramLoginWidgetOptions = {
  /** Redirect flow (recommended) — must match BotFather domain, e.g. /auth/telegram */
  useRedirectAuth?: boolean;
};

/**
 * Official Telegram Login Widget for web browsers.
 * @see https://core.telegram.org/widgets/login
 */
export function mountTelegramLoginWidget(
  container: HTMLElement,
  botUsername: string,
  onAuth: (user: TelegramWidgetAuthPayload) => void,
  options?: MountTelegramLoginWidgetOptions,
): () => void {
  const useRedirect = options?.useRedirectAuth ?? true;

  if (useRedirect) {
    rememberTelegramLoginReturnPath();
  } else {
    window.onTelegramAuth = onAuth;
  }

  container.innerHTML = "";
  const script = document.createElement("script");
  script.src = "https://telegram.org/js/telegram-widget.js?22";
  script.async = true;
  script.setAttribute("data-telegram-login", botUsername);
  script.setAttribute("data-size", "large");
  script.setAttribute("data-radius", "12");
  script.setAttribute("data-request-access", "write");

  if (useRedirect) {
    script.setAttribute("data-auth-url", getTelegramWidgetAuthUrl());
  } else {
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
  }

  container.appendChild(script);

  return () => {
    if (!useRedirect) {
      delete window.onTelegramAuth;
    }
    container.innerHTML = "";
  };
}
