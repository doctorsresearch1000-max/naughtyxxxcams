import type { TelegramWidgetAuthPayload } from "@/lib/auth/verifyTelegram";
import { normalizeWidgetAuthPayload } from "@/lib/auth/verifyTelegram";

const RETURN_KEY = "nx-tg-return";

export function rememberTelegramLoginReturnPath(): void {
  if (typeof window === "undefined") return;
  const path = `${window.location.pathname}${window.location.search}`;
  sessionStorage.setItem(RETURN_KEY, path || "/profile");
}

export function consumeTelegramLoginReturnPath(): string {
  if (typeof window === "undefined") return "/profile";
  const stored = sessionStorage.getItem(RETURN_KEY);
  sessionStorage.removeItem(RETURN_KEY);
  return stored && stored.startsWith("/") ? stored : "/profile";
}

/** Production domain for BotFather must match this origin (see NEXT_PUBLIC_SITE_URL). */
export function getTelegramWidgetAuthUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : configured?.replace(/\/$/, "") || "https://naughtyxxxcams.com";

  const base =
    configured && !configured.includes("localhost")
      ? configured.replace(/\/$/, "")
      : origin.replace(/\/$/, "");

  return `${base}/auth/telegram`;
}

export function parseWidgetAuthFromSearchParams(
  params: URLSearchParams,
): TelegramWidgetAuthPayload | null {
  if (!params.get("hash")) return null;
  return normalizeWidgetAuthPayload({
    id: params.get("id") ?? undefined,
    first_name: params.get("first_name") ?? undefined,
    last_name: params.get("last_name") ?? undefined,
    username: params.get("username") ?? undefined,
    photo_url: params.get("photo_url") ?? undefined,
    auth_date: params.get("auth_date") ?? undefined,
    hash: params.get("hash") ?? undefined,
  });
}
