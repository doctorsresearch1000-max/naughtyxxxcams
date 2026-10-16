import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { getGoTokenSecret } from "@/lib/go/goTokenSecret";
import type { JerkmatePromoKey } from "@/lib/go/jerkmatePromoKeys";
import { isJerkmatePromoKey } from "@/lib/go/jerkmatePromoKeys";
import { performerProfileSlug } from "@/lib/profile/performerHandle";
import {
  consumeGoTokenNonce,
  registerGoTokenNonce,
} from "@/lib/go/goTokenNonceStore";
import type { GoAffiliateTarget } from "@/lib/go/resolveGoAffiliateUrl";

export const GO_TOKEN_TTL_SEC = 60;

type GoTokenPayload = {
  v: 1;
  exp: number;
  nonce: string;
  slug?: string;
  promo?: JerkmatePromoKey;
};

function b64urlEncode(input: string): string {
  return Buffer.from(input, "utf8")
    .toString("base64url")
    .replace(/=+$/g, "");
}

function b64urlDecode(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

function signPayload(encodedPayload: string): string {
  return createHmac("sha256", getGoTokenSecret())
    .update(encodedPayload)
    .digest("base64url");
}

export function createGoToken(target: GoAffiliateTarget): string {
  const nonce = randomBytes(16).toString("hex");
  const exp = Math.floor(Date.now() / 1000) + GO_TOKEN_TTL_SEC;

  const payload: GoTokenPayload = {
    v: 1,
    exp,
    nonce,
    ...(target.kind === "profile" ? { slug: target.slug } : { promo: target.promo }),
  };

  registerGoTokenNonce(nonce, GO_TOKEN_TTL_SEC * 1000 + 5_000);

  const encoded = b64urlEncode(JSON.stringify(payload));
  const sig = signPayload(encoded);
  return `${encoded}.${sig}`;
}

export type VerifiedGoToken = {
  target: GoAffiliateTarget;
};

export function verifyAndConsumeGoToken(token: string): VerifiedGoToken | null {
  const trimmed = token.trim();
  const dot = trimmed.lastIndexOf(".");
  if (dot <= 0) return null;

  const encoded = trimmed.slice(0, dot);
  const sig = trimmed.slice(dot + 1);
  const expected = signPayload(encoded);

  try {
    const a = Buffer.from(sig, "base64url");
    const b = Buffer.from(expected, "base64url");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  let payload: GoTokenPayload;
  try {
    payload = JSON.parse(b64urlDecode(encoded)) as GoTokenPayload;
  } catch {
    return null;
  }

  if (payload.v !== 1 || !payload.nonce) return null;
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(payload.exp) || payload.exp < now) return null;
  if (!consumeGoTokenNonce(payload.nonce)) return null;

  if (payload.promo) {
    if (!isJerkmatePromoKey(payload.promo)) return null;
    return { target: { kind: "promo", promo: payload.promo } };
  }

  const slug = performerProfileSlug(payload.slug ?? "");
  if (!slug) return null;
  return { target: { kind: "profile", slug } };
}
