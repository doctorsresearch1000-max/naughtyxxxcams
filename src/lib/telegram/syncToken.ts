import { createHmac, timingSafeEqual } from "node:crypto";

const TTL_MS = 90 * 24 * 60 * 60 * 1000;

function signPayload(payload: string, botToken: string): string {
  return createHmac("sha256", botToken).update(payload).digest("hex");
}

/** HMAC token for Telegram library sync (server-issued after login). */
export function issueTelegramSyncToken(
  userId: number,
  botToken: string,
): string {
  const exp = Date.now() + TTL_MS;
  const payload = `${userId}.${exp}`;
  const sig = signPayload(payload, botToken);
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

export function verifyTelegramSyncToken(
  token: string,
  botToken: string,
): number | null {
  if (!token || !botToken) return null;
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [idPart, expPart, sig] = decoded.split(".");
    if (!idPart || !expPart || !sig) return null;
    const userId = Number(idPart);
    const exp = Number(expPart);
    if (!Number.isFinite(userId) || !Number.isFinite(exp)) return null;
    if (Date.now() > exp) return null;
    const expected = signPayload(`${idPart}.${expPart}`, botToken);
    const a = Buffer.from(sig, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    return userId;
  } catch {
    return null;
  }
}
