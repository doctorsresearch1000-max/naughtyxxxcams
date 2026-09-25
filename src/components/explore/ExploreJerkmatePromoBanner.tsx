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
      className="relative overflow-hidden rounded-[22px] border border-white/[0.07] bg-gradient-to-br from-[#1a454c] via-[#1a1d24] to-[#0a0b0e] shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
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
      ) : (
        <div
          className="pointer-events-none absolute bottom-0 right-0 top-0 w-[42%] bg-gradient-to-l from-pink-900/30 to-transparent"
          aria-hidden
        />
      )}
    </div>
  );
}
