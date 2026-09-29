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
        className="bg-emerald-500/90 text-white text-[10px] md:text-xs font-black tracking-wider px-2.5 py-1 rounded-full uppercase shadow-md"
      >
        JOIN FREE
      </span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          openRoom();
        }}
        className="bg-rose-600/90 text-white text-[10px] md:text-xs font-bold tracking-wider px-2.5 py-1 rounded-full uppercase shadow-md animate-pulse"
      >
        JERK OFF WITH SOUND 🔊
      </button>
    </div>
  );
}
