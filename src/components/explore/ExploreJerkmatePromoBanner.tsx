"use client";

import Image from "next/image";
import { AffiliateOutboundLink } from "@/components/conversion/AffiliateOutboundLink";

type ExploreJerkmatePromoBannerProps = {
  affiliateUrl: string;
  coverUrl: string | null;
};

export function ExploreJerkmatePromoBanner({
  affiliateUrl,
  coverUrl,
}: ExploreJerkmatePromoBannerProps) {
  return (
    <div className="w-full">
      {/* Mobile */}
      <div
        className="relative overflow-hidden rounded-[22px] border border-white/[0.07] bg-gradient-to-br from-[#1a454c] via-[#1a1d24] to-[#0a0b0e] shadow-[0_16px_48px_rgba(0,0,0,0.5)] lg:hidden"
        aria-label="Jerkmate offer"
      >
        <div className="pointer-events-none absolute -left-8 top-0 h-full w-1/2 bg-[radial-gradient(ellipse_at_left,rgba(45,212,191,0.18),transparent_70%)]" />
        <div className="relative z-10 flex min-h-[148px] flex-col justify-center gap-2.5 p-4 pr-[44%] sm:min-h-[156px]">
          <p className="text-[15px] font-black uppercase leading-[1.15] tracking-tight text-white sm:text-base">
            Jerk off for free
            <br />
            with Jerkmate models
          </p>
          <AffiliateOutboundLink
            href={affiliateUrl}
            className="mt-0.5 inline-flex w-full max-w-[210px] items-center justify-center rounded-full bg-[#c8ff00] px-4 py-3 text-xs font-extrabold text-black shadow-[0_0_28px_rgba(200,255,0,0.28)] transition active:scale-[0.98]"
          >
            Watch FREE now
          </AffiliateOutboundLink>
        </div>
        {coverUrl ? (
          <div className="pointer-events-none absolute bottom-0 right-0 top-0 w-[48%]">
            <Image
              src={coverUrl}
              alt=""
              fill
              className="object-cover object-top"
              sizes="220px"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#1a1d24]/50 to-[#1a1d24]" />
          </div>
        ) : null}
      </div>

      {/* Desktop — native 2-column card, max width */}
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
              Live cam models online
            </p>
            <p className="max-w-md text-sm text-zinc-400">
              Chat, request private shows, or watch for free.
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
              {coverUrl ? (
                <Image
                  src={coverUrl}
                  alt=""
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1400px) 40vw, 520px"
                  unoptimized
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-zinc-800 to-zinc-950" />
              )}
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
