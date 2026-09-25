"use client";

import Link from "next/link";
import { useCallback, type MouseEvent } from "react";
import { DesktopLivePlayerShell } from "@/components/desktop/DesktopLivePlayerShell";
import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import {
  performerDisplayTags,
  performerShortBio,
} from "@/lib/desktop/performerCatalogMeta";
import {
  performerMetaLine,
  performerStarRating,
} from "@/lib/desktop/desktopCatalogFilters";
import { useDesktopGatedAction } from "@/hooks/useDesktopGatedAction";
import { performerProfilePathFromPerformer } from "@/lib/profile/performerHandle";
import { buildModelAffiliateUrl } from "@/lib/crackrevenue/affiliate";

type DesktopImmersiveRoomDialogProps = {
  performer: FeedPerformer | null;
  onClose: () => void;
};

function hasInteractiveToy(performer: FeedPerformer): boolean {
  const tags = [
    ...(performer.autoTags ?? []),
    ...(performer.characteristicsTags ?? []),
  ]
    .join(" ")
    .toLowerCase();
  return tags.includes("toy") || tags.includes("interactive");
}

export function DesktopImmersiveRoomDialog({
  performer,
  onClose,
}: DesktopImmersiveRoomDialogProps) {
  const { runGated, gateAnchorClick } = useDesktopGatedAction();

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!performer) return null;

  const name = performer.nameClean || performer.name || "Model";
  const age = performer.characteristic?.age;
  const profilePath = performerProfilePathFromPerformer(performer);
  const affiliateUrl = buildModelAffiliateUrl(performer);
  const rating = performerStarRating(performer);
  const showToy = hasInteractiveToy(performer);
  const tags = performerDisplayTags(performer);

  const openChat = (e: MouseEvent<HTMLAnchorElement>) => {
    gateAnchorClick(e, affiliateUrl);
  };

  return (
    <div className="fixed inset-0 z-[100005] hidden items-center justify-center p-4 lg:flex">
      <button
        type="button"
        aria-label="Close live room"
        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${name} live room`}
        className="relative z-10 flex h-[min(92vh,900px)] w-full max-w-6xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl ring-1 ring-[#39FF14]/15"
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute left-4 top-4 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900/90 text-zinc-300 ring-1 ring-zinc-700 transition hover:text-white hover:ring-[#39FF14]/50"
          aria-label="Close"
        >
          &times;
        </button>

        <div className="relative min-h-0 min-w-0 flex-1">
          <DesktopLivePlayerShell performer={performer} fillParent />
        </div>

        <aside className="flex w-full max-w-[340px] shrink-0 flex-col overflow-y-auto border-l border-zinc-800 bg-zinc-900/98 p-5">
          <p className="pr-6 text-xl font-black text-white">
            {name}
            {typeof age === "number" ? `, ${age}` : ""}
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            ★ {rating.toFixed(1)} · Live now
          </p>
          <p className="mt-2 text-xs text-zinc-500">{performerMetaLine(performer)}</p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-zinc-950 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-300 ring-1 ring-zinc-800"
              >
                {tag}
              </span>
            ))}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-zinc-300">
            {performerShortBio(performer)}
          </p>

          <div className="mt-6 flex flex-col gap-2.5">
            <a
              href={affiliateUrl}
              target="_blank"
              rel="nofollow noopener"
              onClick={openChat}
              className="flex w-full items-center justify-between rounded-xl bg-[#39FF14] px-4 py-3.5 text-sm font-extrabold text-black shadow-[0_0_24px_rgba(57,255,20,0.35)] transition hover:brightness-110"
            >
              Open private chat
              <span aria-hidden>💬</span>
            </a>

            {showToy ? (
              <button
                type="button"
                onClick={() =>
                  runGated(() => {
                    window.open(affiliateUrl, "_blank", "noopener,noreferrer");
                  })
                }
                className="flex w-full items-center justify-between rounded-xl border border-[#39FF14]/35 bg-zinc-950 px-4 py-3.5 text-sm font-semibold text-zinc-100 transition hover:border-[#39FF14]"
              >
                Interactive toy
                <span aria-hidden>🎮</span>
              </button>
            ) : null}
          </div>

          {profilePath ? (
            <Link
              href={profilePath}
              className="mt-6 inline-flex items-center justify-center rounded-xl border border-zinc-700 px-4 py-3 text-sm font-bold text-white transition hover:border-[#39FF14]/50 hover:text-[#39FF14]"
            >
              Full profile & gallery →
            </Link>
          ) : null}

          <p className="mt-4 text-[11px] leading-relaxed text-zinc-500">
            Stream plays instantly from the live API. Sign up is only required
            for chat and premium interactions.
          </p>
        </aside>
      </div>
    </div>
  );
}
