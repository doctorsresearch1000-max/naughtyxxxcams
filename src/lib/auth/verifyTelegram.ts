import { createHmac, createHash, timingSafeEqual } from "crypto";

export type TelegramWidgetAuthPayload = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

const MAX_AUTH_AGE_SEC = 86_400;

function safeEqualHex(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a, "hex");
    const bb = Buffer.from(b, "hex");
    if (ba.length !== bb.length) return false;
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

/** https://core.telegram.org/widgets/login#checking-authorization */
export function verifyTelegramLoginWidget(
  auth: TelegramWidgetAuthPayload,
  botToken: string,
): boolean {
  if (!botToken || !auth.hash) return false;
  const age = Math.floor(Date.now() / 1000) - auth.auth_date;
  if (!Number.isFinite(age) || age < 0 || age > MAX_AUTH_AGE_SEC) return false;

  const { hash, ...rest } = auth;
  const pairs = Object.entries(rest)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => [k, String(v)] as const)
    .sort(([a], [b]) => a.localeCompare(b));

  const dataCheckString = pairs.map(([k, v]) => `${k}=${v}`).join("\n");
  const secretKey = createHash("sha256").update(botToken).digest();
  const computed = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  return safeEqualHex(computed, hash);
}

/** https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app */
export function verifyTelegramWebAppInitData(
  initData: string,
  botToken: string,
): boolean {
  if (!botToken || !initData.trim()) return false;

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return false;
  params.delete("hash");

  const authDate = params.get("auth_date");
  if (authDate) {
    const age = Math.floor(Date.now() / 1000) - Number(authDate);
    if (!Number.isFinite(age) || age < 0 || age > MAX_AUTH_AGE_SEC) return false;
  }

  const entries = [...params.entries()].sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join("\n");
  const secretKey = createHmac("sha256", "WebAppData").update(botToken).digest();
  const computed = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  return safeEqualHex(computed, hash);
}

export function parseTelegramUserFromInitData(
  initData: string,
): TelegramWidgetAuthPayload | null {
  const params = new URLSearchParams(initData);
  const rawUser = params.get("user");
  if (!rawUser) return null;
  try {
    const user = JSON.parse(rawUser) as {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      photo_url?: string;
    };
    const auth_date = Number(params.get("auth_date"));
    const hash = params.get("hash") ?? "";
    if (!user.id || !user.first_name || !auth_date || !hash) return null;
    return {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      photo_url: user.photo_url,
      auth_date,
      hash,
    };
  } catch {
    return null;
  }
}
