import {
  type TelegramUser,
  writeSyncToken,
} from "@/lib/auth/telegramSession";
import type { TelegramWidgetAuthPayload } from "@/lib/auth/verifyTelegram";

export async function verifyTelegramWidgetLogin(
  auth: TelegramWidgetAuthPayload,
): Promise<TelegramUser | null> {
  const res = await fetch("/api/auth/telegram", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "widget", auth }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    user?: TelegramUser;
    syncToken?: string;
  };
  if (json.syncToken) writeSyncToken(json.syncToken);
  return json.user ?? null;
}

export async function verifyTelegramMiniAppInitData(
  initData: string,
): Promise<TelegramUser | null> {
  const res = await fetch("/api/auth/telegram", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "web_app", initData }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    user?: TelegramUser;
    syncToken?: string;
  };
  if (json.syncToken) writeSyncToken(json.syncToken);
  return json.user ?? null;
}
