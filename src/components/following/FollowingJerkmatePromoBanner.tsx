"use client";

import Image from "next/image";
import { JerkmateNaturalBanner } from "@/components/ads/JerkmateNaturalBanner";
import { pickJerkmateNaturalBannerSrc } from "@/lib/ads/jerkmateLocalBanner";
import { AffiliateOutboundLink } from "@/components/conversion/AffiliateOutboundLink";
import { JERKMATE_MOBILE_GIF_TRACKING_URL } from "@/lib/crackrevenue/jerkmateTracking";

/** Mobile: natural GIF banner. Desktop: premium 2-column card (matches /explore). */
export function FollowingJerkmatePromoBanner() {
  const coverSrc = pickJerkmateNaturalBannerSrc(2);
  const affiliateUrl = JERKMATE_MOBILE_GIF_TRACKING_URL;

  return (
    <div className="w-full">
      <JerkmateNaturalBanner
        href={affiliateUrl}
        imageSrc={coverSrc}
        alt="Jerkmate live cams offer"
        className="my-2 lg:hidden"
      />

      <div
        className="mx-auto hidden w-full max-w-[1400px] lg:block"
        aria-label="Jerkmate offer"
      >
        <div
          className="grid h-32 grid-cols-[3fr_2fr] overflow-hidden rounded-2xl border border-white/[0.08] bg-neutral-900 shadow-[0_12px_40px_rgba(0,0,0,0.45)] xl:h-36"
        >
          <div
            className="relative z-10 flex flex-col justify-center gap-2.5 bg-gradient-to-r from-neutral-900 via-neutral-900/95 to-neutral-900/40 px-6 py-4"
          >
            <p className="text-lg font-black uppercase leading-tight tracking-tight text-white xl:text-xl">
              Your follows + more live now
            </p>
            <p className="max-w-md text-sm text-zinc-400">
              Watch free public shows or jump into private chat on Jerkmate.
            </p>
            <AffiliateOutboundLink
              href={affiliateUrl}
              className="inline-flex w-fit items-center justify-center rounded-xl bg-[#39FF14] px-5 py-2.5 text-sm font-extrabold text-black shadow-[0_0_24px_rgba(57,255,20,0.35)] transition-transform duration-200 hover:scale-105 hover:brightness-110 active:scale-[0.98]"
            >
              Watch FREE now
            </AffiliateOutboundLink>
          </div>

          <div className="relative min-h-0 overflow-hidden bg-[#12141a]">
            <div className="relative h-full w-full min-h-[8rem] xl:min-h-[9rem]">
              <Image
                src={coverSrc}
                alt=""
                fill
                className="object-cover object-center"
                sizes="(max-width: 1400px) 40vw, 520px"
                unoptimized
              />
            </div>
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-neutral-900 via-neutral-900/70 to-transparent"
              aria-hidden
            />
          </div>
        </div>
      </div>
    </div>
  );
}
