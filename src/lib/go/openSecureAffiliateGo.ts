"use client";

import type { JerkmatePromoKey } from "@/lib/go/jerkmatePromoKeys";

export type SecureAffiliateGoTarget =
  | { profileSlug: string }
  | { promo: JerkmatePromoKey };

function readTelegramInitData(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const tg = (window as Window & { Telegram?: { WebApp?: { initData?: string } } })
    .Telegram?.WebApp?.initData;
  return tg?.trim() || undefined;
}

export async function requestAffiliateGoToken(
  target: SecureAffiliateGoTarget,
): Promise<string | null> {
  const body =
    "profileSlug" in target
      ? { slug: target.profileSlug }
      : { promo: target.promo };

  const telegramInitData = readTelegramInitData();

  const res = await fetch("/api/go-token", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...body,
      telegramInitData,
    }),
  });

  if (!res.ok) return null;
  const json = (await res.json()) as { token?: string };
  return json.token?.trim() || null;
}

export async function openSecureAffiliateGo(
  target: SecureAffiliateGoTarget,
): Promise<boolean> {
  const token = await requestAffiliateGoToken(target);
  if (!token) return false;
  const url = `/go/room?t=${encodeURIComponent(token)}`;
  window.open(url, "_blank", "noopener,noreferrer");
  return true;
}
