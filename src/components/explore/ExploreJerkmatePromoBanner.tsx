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
    <div
      className="relative overflow-hidden rounded-[22px] border border-white/[0.07] bg-gradient-to-br from-[#1a454c] via-[#1a1d24] to-[#0a0b0e] shadow-[0_16px_48px_rgba(0,0,0,0.5)] transition-transform duration-200 hover:scale-[1.01] lg:max-h-[110px] lg:rounded-2xl"
      aria-label="Jerkmate offer"
    >
      {/* Mobile: stacked + absolute model */}
      <div className="lg:hidden">
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

      {/* Desktop: compact 2-column */}
      <div
        className="relative hidden h-28 max-h-[110px] grid-cols-[1fr_200px] gap-0 lg:grid"
      >
        <div className="pointer-events-none absolute -left-8 top-0 h-full w-1/2 bg-[radial-gradient(ellipse_at_left,rgba(45,212,191,0.18),transparent_70%)]" />
        <div className="relative z-10 flex flex-col justify-center gap-2 px-5 py-3">
          <p className="text-sm font-black uppercase leading-tight tracking-tight text-white">
            Jerk off for free with Jerkmate models
          </p>
          <AffiliateOutboundLink
            href={affiliateUrl}
            className="inline-flex w-fit items-center justify-center rounded-full bg-[#c8ff00] px-4 py-2 text-[11px] font-extrabold text-black shadow-[0_0_20px_rgba(200,255,0,0.25)] transition active:scale-[0.98]"
          >
            Watch FREE now
          </AffiliateOutboundLink>
        </div>
        <div className="relative h-full min-h-0 overflow-hidden bg-[#12141a]">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt=""
              fill
              className="object-cover object-center"
              sizes="200px"
              unoptimized
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-l from-[#1a1d24] via-transparent to-transparent" />
        </div>
      </div>
    </div>
  );
}
