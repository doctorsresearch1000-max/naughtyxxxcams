"use client";

import Image from "next/image";
import { SecureAffiliateLink } from "@/components/conversion/SecureAffiliateLink";
import { FOLLOWING_BANNER_FALLBACK_STILL } from "@/lib/following/followingLayout";

type FollowingJerkmatePromoBannerProps = {
  previewImageUrl?: string | null;
};

export function FollowingJerkmatePromoBanner({
  previewImageUrl,
}: FollowingJerkmatePromoBannerProps = {}) {
  const imageSrc = previewImageUrl?.trim() || FOLLOWING_BANNER_FALLBACK_STILL;
  return (
    <section className="mx-auto w-full max-w-[1600px] px-3 pb-2 pt-1">
      <SecureAffiliateLink
        promo="jerkmate-following-gif"
        className="relative block w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 ring-1 ring-[#39FF14]/20"
      >
        <div className="relative aspect-[21/9] w-full min-h-[120px] sm:aspect-[3/1]">
          <Image
            src={imageSrc}
            alt="Dick Rating Experience"
            fill
            className="object-cover object-center"
            sizes="(max-width: 1600px) 100vw, 1600px"
            unoptimized
            priority={false}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-transparent" />
          <div className="absolute inset-y-0 left-0 flex max-w-[70%] flex-col justify-center gap-2 px-4 sm:px-6">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#39FF14]">
              Sponsored
            </p>
            <p className="text-lg font-black leading-tight text-white sm:text-xl">
              Dick Rating Experience
            </p>
            <p className="text-xs font-semibold text-zinc-300 sm:text-sm">
              Get rated by top models — limited promo
            </p>
            <span className="mt-1 inline-flex w-fit rounded-full bg-[#39FF14] px-4 py-2 text-xs font-extrabold text-black">
              GET RATED
            </span>
          </div>
        </div>
      </SecureAffiliateLink>
    </section>
  );
}
