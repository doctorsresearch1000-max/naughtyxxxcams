import { NextResponse } from "next/server";
import {
  parseTelegramUserFromInitData,
  verifyTelegramLoginWidget,
  verifyTelegramWebAppInitData,
  type TelegramWidgetAuthPayload,
} from "@/lib/auth/verifyTelegram";
import { getTelegramLoginBotToken } from "@/lib/telegram/config";
import { normalizeWidgetAuthPayload } from "@/lib/auth/verifyTelegram";
import { issueTelegramSyncToken } from "@/lib/telegram/syncToken";
import type { TelegramUser } from "@/lib/auth/telegramSession";

export const dynamic = "force-dynamic";

function toSessionUser(auth: TelegramWidgetAuthPayload): TelegramUser {
  return {
    id: auth.id,
    first_name: auth.first_name,
    last_name: auth.last_name,
    username: auth.username,
    photo_url: auth.photo_url,
  };
}

export async function POST(request: Request) {
  const botToken = getTelegramLoginBotToken();
  if (!botToken) {
    return NextResponse.json(
      { error: "Telegram Login is not configured on the server" },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = body as {
    type?: string;
    auth?: TelegramWidgetAuthPayload;
    initData?: string;
  };

  if (payload.type === "web_app" && payload.initData) {
    if (!verifyTelegramWebAppInitData(payload.initData, botToken)) {
      return NextResponse.json({ error: "Invalid initData" }, { status: 401 });
    }
    const parsed = parseTelegramUserFromInitData(payload.initData);
    if (!parsed) {
      return NextResponse.json({ error: "Missing user" }, { status: 400 });
    }
    const user = toSessionUser(parsed);
    const syncToken = issueTelegramSyncToken(user.id, botToken);
    return NextResponse.json({ ok: true, user, syncToken, source: "mini_app" });
  }

  if (payload.type === "widget" && payload.auth) {
    const auth = normalizeWidgetAuthPayload(
      payload.auth as Record<string, unknown>,
    );
    if (!auth || !verifyTelegramLoginWidget(auth, botToken)) {
      return NextResponse.json({ error: "Invalid login" }, { status: 401 });
    }
    const user = toSessionUser(auth);
    const syncToken = issueTelegramSyncToken(user.id, botToken);
    return NextResponse.json({ ok: true, user, syncToken, source: "login_widget" });
  }

  return NextResponse.json({ error: "Unsupported payload" }, { status: 400 });
}
