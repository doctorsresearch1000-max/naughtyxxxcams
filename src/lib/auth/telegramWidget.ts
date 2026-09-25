import type { TelegramWidgetAuthPayload } from "@/lib/auth/verifyTelegram";

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramWidgetAuthPayload) => void;
  }
}

export function mountTelegramLoginWidget(
  container: HTMLElement,
  botUsername: string,
  onAuth: (user: TelegramWidgetAuthPayload) => void,
): () => void {
  window.onTelegramAuth = onAuth;
  container.innerHTML = "";
  const script = document.createElement("script");
  script.src = "https://telegram.org/js/telegram-widget.js?22";
  script.async = true;
  script.setAttribute("data-telegram-login", botUsername);
  script.setAttribute("data-size", "large");
  script.setAttribute("data-radius", "12");
  script.setAttribute("data-onauth", "onTelegramAuth(user)");
  script.setAttribute("data-request-access", "write");
  container.appendChild(script);

  return () => {
    delete window.onTelegramAuth;
    container.innerHTML = "";
  };
}
