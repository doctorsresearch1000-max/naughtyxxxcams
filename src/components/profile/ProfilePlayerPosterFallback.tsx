"use client";

import Image from "next/image";
import { openAffiliateOutbound } from "@/lib/crackrevenue/jerkmateAffiliate";

type ProfilePlayerPosterFallbackProps = {
  posterUrl: string;
  displayName: string;
  affiliateUrl: string;
  live?: boolean;
  className?: string;
};

/** Poster + affiliate tap target when embed cannot mount or model is offline. */
export function ProfilePlayerPosterFallback({
  posterUrl,
  displayName,
  affiliateUrl,
  live = false,
  className = "",
}: ProfilePlayerPosterFallbackProps) {
  const openRoom = () => openAffiliateOutbound(affiliateUrl);

  return (
    <button
      type="button"
      onClick={openRoom}
      className={`relative h-full w-full overflow-hidden bg-zinc-900 ${className}`}
      aria-label={live ? `Open ${displayName} live room` : `View ${displayName} profile`}
    >
      {posterUrl ? (
        <Image
          src={posterUrl}
          alt={displayName}
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover"
        />
      ) : null}
      <span className="absolute inset-0 bg-black/25" aria-hidden />
      {live ? (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="rounded-full bg-[#39FF14] px-5 py-3 text-sm font-extrabold text-black shadow-lg">
            Enter live room
          </span>
        </span>
      ) : null}
    </button>
  );
}
