import { NextResponse } from "next/server";
import { createGoToken } from "@/lib/go/goToken";
import { isJerkmatePromoKey } from "@/lib/go/jerkmatePromoKeys";
import { performerProfileSlug } from "@/lib/profile/performerHandle";
import {
  isAllowedGoTokenOrigin,
  validateGoHumanProof,
} from "@/lib/go/validateGoHuman";

export const dynamic = "force-dynamic";

type GoTokenBody = {
  slug?: string;
  promo?: string;
  turnstileToken?: string;
  telegramInitData?: string;
};

export async function POST(request: Request) {
  if (!isAllowedGoTokenOrigin(request)) {
    return NextResponse.json({ error: "forbidden_origin" }, { status: 403 });
  }

  let body: GoTokenBody;
  try {
    body = (await request.json()) as GoTokenBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const humanOk = await validateGoHumanProof(request, {
    turnstileToken: body.turnstileToken,
    telegramInitData: body.telegramInitData,
  });
  if (!humanOk) {
    return NextResponse.json({ error: "human_verification_failed" }, { status: 403 });
  }

  const slug = body.slug ? performerProfileSlug(body.slug) : null;
  const promo = body.promo?.trim();

  if (slug) {
    const token = createGoToken({ kind: "profile", slug });
    return NextResponse.json(
      { token, expiresIn: 60 },
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  if (promo && isJerkmatePromoKey(promo)) {
    const token = createGoToken({ kind: "promo", promo });
    return NextResponse.json(
      { token, expiresIn: 60 },
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  return NextResponse.json({ error: "missing_target" }, { status: 400 });
}
