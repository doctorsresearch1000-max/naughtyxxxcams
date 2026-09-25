import {
  type TelegramUser,
  writeSyncToken,
} from "@/lib/auth/telegramSession";
import {
  normalizeWidgetAuthPayload,
  type TelegramWidgetAuthPayload,
} from "@/lib/auth/verifyTelegram";

export async function verifyTelegramWidgetLogin(
  auth: TelegramWidgetAuthPayload | Record<string, unknown>,
): Promise<TelegramUser | null> {
  const normalized = normalizeWidgetAuthPayload(
    auth as Record<string, unknown>,
  );
  if (!normalized) return null;

  const res = await fetch("/api/auth/telegram", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "widget", auth: normalized }),
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
