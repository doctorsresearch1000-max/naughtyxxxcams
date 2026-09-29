"use client";

import { openAffiliateOutbound } from "@/lib/crackrevenue/jerkmateAffiliate";

type ProfileConversionBadgesProps = {
  affiliateUrl: string;
  className?: string;
};

export function ProfileConversionBadges({
  affiliateUrl,
  className = "",
}: ProfileConversionBadgesProps) {
  const openRoom = () => openAffiliateOutbound(affiliateUrl);

  return (
    <div
      className={`flex flex-col items-end gap-1 ${className}`}
      data-profile-conversion-badges="v1"
    >
      <span
        className="bg-emerald-500/95 text-white text-[9px] leading-tight sm:text-[10px] md:text-xs font-black tracking-wide px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full uppercase shadow-md ring-1 ring-black/20"
      >
        JOIN FREE
      </span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          openRoom();
        }}
        className="bg-rose-600/95 text-white text-[9px] leading-tight sm:text-[10px] md:text-xs font-bold tracking-wide px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full uppercase shadow-md ring-1 ring-black/20 animate-pulse text-left"
      >
        JERK OFF WITH SOUND 🔊
      </button>
    </div>
  );
}
