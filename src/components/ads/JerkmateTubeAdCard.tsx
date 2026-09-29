"use client";

import { LiveBadge } from "@/components/cams/LiveBadge";
import { uiStrings } from "@/lib/i18n/uiStrings";
import { JERKMATE_TRACKING_URL } from "@/lib/crackrevenue/jerkmateTracking";
import { pickJerkmateHomeAdCopy } from "@/lib/ads/jerkmateHomeAdCopy";

type JerkmateTubeAdCardProps = {
  adSlotIndex: number;
};

/**
 * Native in-grid Jerkmate card — same footprint as {@link ModelTubeCard}, no external GIF crop.
 */
export function JerkmateTubeAdCard({ adSlotIndex }: JerkmateTubeAdCardProps) {
  const copy = pickJerkmateHomeAdCopy(adSlotIndex);
  const showFreePromo = copy.heroLine.toUpperCase().includes("FREE");

  return (
    <article className="min-w-0">
      <a
        href={JERKMATE_TRACKING_URL}
        target="_blank"
        rel="nofollow noopener sponsored"
        className="group block min-w-0"
      >
        <div
          className={`relative aspect-[4/3] overflow-hidden rounded-[var(--nx-radius-card)] bg-gradient-to-br from-[#2a1038] via-zinc-900 to-[#1a0a28] ring-2 ring-[var(--nx-action)]/80 ring-offset-1 ring-offset-black shadow-[0_0_20px_rgba(57,255,20,0.15)]`}
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(236,72,153,0.25),transparent_55%)]"
            aria-hidden
          />

          <span
            className="absolute left-1.5 top-1.5 z-10 rounded-md bg-black/75 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-zinc-200"
          >
            {uiStrings.adLabel}
          </span>

          {showFreePromo ? (
            <span
              className="absolute right-1.5 top-1.5 z-10 rounded-md border border-[var(--nx-action)] bg-[var(--nx-action)] px-1.5 py-0.5 text-[8px] font-black uppercase text-black shadow-[0_0_12px_rgba(57,255,20,0.5)]"
            >
              Free promo
            </span>
          ) : (
            <span className="absolute right-1.5 top-1.5 z-10">
              <LiveBadge />
            </span>
          )}

          <div className="absolute inset-0 flex flex-col items-center justify-center px-3 text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-pink-300/90">
              {uiStrings.platformJerkmate}
            </p>
            <p className="mt-1.5 text-base font-black leading-tight text-white drop-shadow-sm lg:text-lg">
              {copy.heroLine}
            </p>
            <span
              className="mt-3 rounded-full border-2 border-[var(--nx-action)] bg-[var(--nx-action)] px-3 py-1.5 text-[10px] font-extrabold uppercase text-black shadow-lg transition group-hover:scale-[1.03]"
            >
              {copy.ctaLine}
            </span>
          </div>

          <span
            className="absolute bottom-1.5 right-1.5 z-10 rounded bg-black/70 px-1.5 py-0.5 text-[8px] font-bold uppercase text-zinc-300"
          >
            Partner
          </span>
        </div>

        <div className="space-y-0.5 px-0.5 pb-1 pt-1.5">
          <p className="truncate text-[13px] font-bold leading-tight text-white">
            {copy.brandLine}
          </p>
          <p className="truncate text-right text-[11px] font-semibold uppercase text-[var(--nx-action)]">
            {copy.ctaLine}
          </p>
        </div>
      </a>
    </article>
  );
}
