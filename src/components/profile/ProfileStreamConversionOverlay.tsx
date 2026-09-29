"use client";

import { openAffiliateOutbound } from "@/lib/crackrevenue/jerkmateAffiliate";

type ProfileStreamConversionOverlayProps = {
  affiliateUrl: string;
  posterUrl?: string;
  loading?: boolean;
  className?: string;
};

export function ProfileStreamConversionOverlay({
  affiliateUrl,
  loading = false,
  className = "",
}: ProfileStreamConversionOverlayProps) {
  return (
    <div
      className={`absolute inset-0 z-20 flex flex-col items-center justify-end bg-gradient-to-t from-black/85 via-black/45 to-black/20 px-4 pb-8 pt-16 ${className}`}
      role="region"
      aria-label="Live stream unavailable"
    >
      {loading ? (
        <div
          className="mb-auto mt-auto flex flex-col items-center gap-3"
          role="status"
          aria-label="Loading live stream"
        >
          <div
            className="h-9 w-9 animate-spin rounded-full border-2 border-[#39FF14]/25 border-t-[#39FF14]"
          />
          <span className="text-[11px] font-semibold text-zinc-200">
            Connecting live…
          </span>
        </div>
      ) : null}

      {!loading ? (
        <div className="relative z-10 w-full max-w-sm text-center">
          <p className="text-sm font-black uppercase leading-snug tracking-wide text-white md:text-base">
            🔴 THIS MODEL IS CURRENTLY IN PRIVATE SHOW
          </p>
          <button
            type="button"
            onClick={() => openAffiliateOutbound(affiliateUrl)}
            className="mt-4 w-full rounded-full bg-gradient-to-r from-rose-600 to-orange-500 px-5 py-3.5 text-sm font-extrabold uppercase tracking-wide text-white shadow-lg shadow-rose-900/40 transition active:scale-[0.99]"
          >
            🔥 WATCH LIVE ON JERKMATE
          </button>
        </div>
      ) : null}
    </div>
  );
}
