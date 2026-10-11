"use client";

import Image from "next/image";
import { JerkmateNaturalBanner } from "@/components/ads/JerkmateNaturalBanner";
import { AffiliateOutboundLink } from "@/components/conversion/AffiliateOutboundLink";
import { JERKMATE_MOBILE_GIF_TRACKING_URL } from "@/lib/crackrevenue/jerkmateTracking";
import {
  FOLLOWING_BANNER_FALLBACK_STILL,
  FOLLOWING_DESKTOP_SHELL_CLASS,
} from "@/lib/following/followingLayout";

type FollowingJerkmatePromoBannerProps = {
  /** Live model snapshot — avoids sponsor GIFs with embedded ad copy. */
  previewImageUrl?: string | null;
};

export function FollowingJerkmatePromoBanner({
  previewImageUrl,
}: FollowingJerkmatePromoBannerProps) {
  const affiliateUrl = JERKMATE_MOBILE_GIF_TRACKING_URL;
  const coverSrc =
    previewImageUrl?.trim() || FOLLOWING_BANNER_FALLBACK_STILL;

  return (
    <div className={`${FOLLOWING_DESKTOP_SHELL_CLASS} w-full`}>
      <div className="my-2 lg:hidden">
        <h2 className="text-base font-black uppercase leading-tight tracking-tight text-white">
          Free live cams &amp; private shows
        </h2>
        <p className="mt-1.5 text-sm text-zinc-300">
          Click below to unlock live models and start chatting instantly.
        </p>
        <AffiliateOutboundLink
          href={affiliateUrl}
          className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-[#39FF14] px-4 py-3 text-sm font-extrabold uppercase tracking-wide text-black shadow-[0_0_20px_rgba(57,255,20,0.3)] transition active:scale-[0.98]"
        >
          Start watching now
        </AffiliateOutboundLink>
        <JerkmateNaturalBanner
          href={affiliateUrl}
          imageSrc={coverSrc}
          alt="Live cam models"
          className="mt-3"
        />
      </div>

      <div
        className="relative hidden h-32 overflow-hidden rounded-2xl border border-white/[0.08] bg-neutral-950 shadow-[0_12px_40px_rgba(0,0,0,0.45)] xl:h-36 lg:block"
        aria-label="Jerkmate offer"
      >
        <Image
          src={coverSrc}
          alt=""
          fill
          priority
          className="object-cover object-center opacity-100"
          sizes="(max-width: 1600px) 100vw, 1600px"
          unoptimized
        />

        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-[35%] max-w-[480px] bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent"
          aria-hidden
        />

        <div
          className="relative z-10 flex h-full max-w-[58%] flex-col justify-center gap-2.5 px-6 py-4"
        >
          <h2 className="text-lg font-black uppercase leading-tight tracking-tight text-white xl:text-xl">
            Free live cams &amp; private shows
          </h2>
          <p className="max-w-md text-sm font-medium text-zinc-200">
            Click below to unlock live models and start chatting instantly.
          </p>
          <AffiliateOutboundLink
            href={affiliateUrl}
            className="inline-flex w-fit items-center justify-center rounded-xl bg-[#39FF14] px-5 py-2.5 text-sm font-extrabold uppercase tracking-wide text-black shadow-[0_0_24px_rgba(57,255,20,0.35)] transition-transform duration-200 hover:scale-105 hover:brightness-110 active:scale-[0.98]"
          >
            Start watching now
          </AffiliateOutboundLink>
        </div>
      </div>
    </div>
  );
}
