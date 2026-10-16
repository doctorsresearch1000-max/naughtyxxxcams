import { verifyTelegramWebAppInitData } from "@/lib/auth/verifyTelegram";

const TELEGRAM_GO_MAX_AGE_SEC = 3600;

function siteOrigin(): string | null {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

export function isAllowedGoTokenOrigin(request: Request): boolean {
  const expected = siteOrigin();
  if (!expected) return true;

  const origin = request.headers.get("origin")?.trim();
  if (!origin) {
    const secFetchSite = request.headers.get("sec-fetch-site");
    return secFetchSite === "same-origin" || secFetchSite === "same-site";
  }

  try {
    return new URL(origin).origin === expected;
  } catch {
    return false;
  }
}

function verifyTelegramInitDataFresh(initData: string, botToken: string): boolean {
  if (!verifyTelegramWebAppInitData(initData, botToken)) return false;
  const params = new URLSearchParams(initData);
  const authDate = Number(params.get("auth_date"));
  if (!Number.isFinite(authDate)) return false;
  const age = Math.floor(Date.now() / 1000) - authDate;
  return age >= 0 && age <= TELEGRAM_GO_MAX_AGE_SEC;
}

async function verifyTurnstile(
  token: string,
  remoteIp: string | null,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }

  const body = new URLSearchParams({
    secret,
    response: token,
  });
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      },
    );
    const json = (await res.json()) as { success?: boolean };
    return json.success === true;
  } catch {
    return false;
  }
}

export type GoHumanProof = {
  turnstileToken?: string;
  telegramInitData?: string;
};

export async function validateGoHumanProof(
  request: Request,
  proof: GoHumanProof,
): Promise<boolean> {
  if (process.env.GO_TOKEN_SKIP_HUMAN_VERIFY === "1") return true;

  const initData = proof.telegramInitData?.trim();
  if (initData) {
    const botToken =
      process.env.TELEGRAM_BOT_TOKEN?.trim() ??
      process.env.BOT_TOKEN?.trim() ??
      "";
    if (botToken && verifyTelegramInitDataFresh(initData, botToken)) {
      return true;
    }
  }

  const turnstile = proof.turnstileToken?.trim();
  if (turnstile) {
    const ip =
      request.headers.get("cf-connecting-ip") ??
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      null;
    if (await verifyTurnstile(turnstile, ip)) return true;
  }

  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  const fetchSite = request.headers.get("sec-fetch-site");
  if (
    (fetchSite === "same-origin" || fetchSite === "same-site") &&
    isAllowedGoTokenOrigin(request)
  ) {
    return true;
  }

  return false;
}
