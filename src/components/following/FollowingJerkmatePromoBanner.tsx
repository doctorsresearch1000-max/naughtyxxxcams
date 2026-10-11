"use client";

import Image from "next/image";
import { AffiliateOutboundLink } from "@/components/conversion/AffiliateOutboundLink";
import { JERKMATE_FOLLOWING_GIF_TRACKING_URL } from "@/lib/crackrevenue/jerkmateTracking";
import {
  FOLLOWING_BANNER_FALLBACK_STILL,
  FOLLOWING_DESKTOP_SHELL_CLASS,
} from "@/lib/following/followingLayout";

type FollowingJerkmatePromoBannerProps = {
  /** Faint left-side backdrop (Jerkmate-style glow banner). */
  previewImageUrl?: string | null;
};

function JerkmateRatingBannerChrome({
  previewSrc,
  className = "",
}: {
  previewSrc: string;
  className?: string;
}) {
  const affiliateUrl = JERKMATE_FOLLOWING_GIF_TRACKING_URL;

  return (
    <div
      className={`relative overflow-hidden bg-[#0a0f14] ${className}`}
      aria-label="Jerkmate offer"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#4c1d6e] via-[#e91e8c]/35 to-[#0a1620]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_120%_at_18%_50%,rgba(236,72,153,0.55),transparent_58%)]"
        aria-hidden
      />

      <div className="pointer-events-none absolute inset-y-0 left-0 w-[42%] max-w-[520px] overflow-hidden">
        <Image
          src={previewSrc}
          alt=""
          fill
          className="object-cover object-left-top opacity-45 mix-blend-luminosity"
          sizes="520px"
          unoptimized
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#4c1d6e]/80 via-transparent to-transparent"
          aria-hidden
        />
      </div>

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/70"
        aria-hidden
      />

      <div className="relative z-10 flex h-full min-h-[5.5rem] items-stretch sm:min-h-[6.25rem] lg:min-h-[7rem]">
        <div className="flex min-w-0 flex-1 items-center overflow-hidden pl-3 pr-2 sm:pl-5 sm:pr-4">
          <h2
            className="select-none font-black uppercase italic leading-[0.95] tracking-tight text-white [-webkit-text-stroke:0.5px_rgba(0,0,0,0.35)] sm:text-[clamp(1.35rem,3.2vw,2.35rem)] text-[1.15rem]"
            style={{ marginLeft: "-0.12em" }}
          >
            The rating experience
          </h2>
        </div>

        <div className="flex shrink-0 items-center px-2 sm:px-4">
          <AffiliateOutboundLink
            href={affiliateUrl}
            className="inline-flex items-center justify-center rounded-full bg-[#cdf024] px-5 py-2.5 text-xs font-extrabold uppercase tracking-wide text-black shadow-[0_0_22px_rgba(205,240,36,0.35)] transition hover:brightness-110 active:scale-[0.98] sm:px-8 sm:py-3 sm:text-sm"
          >
            Get rated
          </AffiliateOutboundLink>
        </div>

        <div className="hidden shrink-0 items-stretch sm:flex">
          <div className="flex max-w-[7.5rem] items-center justify-end bg-black px-3 py-2 text-right">
            <p className="text-[9px] font-bold uppercase leading-[1.15] tracking-wide text-white xl:text-[10px]">
              Camgirl
              <br />
              of the
              <br />
              month
            </p>
          </div>
          <div
            className="flex w-9 items-center justify-center bg-[#cdf024] font-black text-lg text-black xl:w-10 xl:text-xl"
            aria-hidden
          >
            B
          </div>
        </div>
      </div>
    </div>
  );
}

export function FollowingJerkmatePromoBanner({
  previewImageUrl,
}: FollowingJerkmatePromoBannerProps) {
  const coverSrc =
    previewImageUrl?.trim() || FOLLOWING_BANNER_FALLBACK_STILL;

  return (
    <div className={`${FOLLOWING_DESKTOP_SHELL_CLASS} w-full`}>
      <div className="my-2 lg:hidden">
        <JerkmateRatingBannerChrome
          previewSrc={coverSrc}
          className="rounded-xl border border-white/[0.06]"
        />
      </div>

      <JerkmateRatingBannerChrome
        previewSrc={coverSrc}
        className="hidden rounded-2xl border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.45)] lg:block"
      />
    </div>
  );
}
