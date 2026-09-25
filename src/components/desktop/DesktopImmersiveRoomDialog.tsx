"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState, type MouseEvent } from "react";
import { LiveEmbed } from "@/components/feed/LiveEmbed";
import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import { performerStarRating } from "@/lib/desktop/desktopCatalogFilters";
import { useDesktopGatedAction } from "@/hooks/useDesktopGatedAction";
import { performerProfilePathFromPerformer } from "@/lib/profile/performerHandle";
import { buildModelAffiliateUrl } from "@/lib/crackrevenue/affiliate";

type DesktopImmersiveRoomDialogProps = {
  performer: FeedPerformer | null;
  onClose: () => void;
};

function hasInteractiveToy(performer: FeedPerformer): boolean {
  const blob = [
    ...(performer.autoTags ?? []),
    ...(performer.characteristicsTags ?? []),
  ]
    .join(" ")
    .toLowerCase();
  return blob.includes("toy") || blob.includes("interactive");
}

export function DesktopImmersiveRoomDialog({
  performer,
  onClose,
}: DesktopImmersiveRoomDialogProps) {
  const { runGated, gateAnchorClick } = useDesktopGatedAction();
  const [streamActive, setStreamActive] = useState(false);

  const handleClose = useCallback(() => {
    setStreamActive(false);
    onClose();
  }, [onClose]);

  if (!performer) return null;

  const name =
    performer.nameClean || performer.name || "Model";
  const preview =
    performer.liveSnapshotURL || performer.posterUrl;
  const profilePath = performerProfilePathFromPerformer(performer);
  const affiliateUrl = buildModelAffiliateUrl(performer);
  const rating = performerStarRating(performer);
  const showToy = hasInteractiveToy(performer);

  const startStream = () => {
    runGated(() => setStreamActive(true));
  };

  const openChat = (e: MouseEvent<HTMLAnchorElement>) => {
    gateAnchorClick(e, affiliateUrl);
    if (!e.defaultPrevented) return;
  };

  return (
    <div className="fixed inset-0 z-[100005] hidden items-center justify-center p-6 lg:flex">
      <button
        type="button"
        aria-label="Close room preview"
        className="absolute inset-0 bg-zinc-950/70 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${name} live room`}
        className="relative z-10 flex w-full max-w-5xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl ring-1 ring-[#39FF14]/10"
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900/90 text-zinc-300 ring-1 ring-zinc-700 transition hover:text-white hover:ring-[#39FF14]/50"
          aria-label="Close"
        >
          &times;
        </button>

        <div className="relative min-h-[min(72vh,640px)] flex-1 bg-zinc-900">
          {streamActive && performer.embedPlan.canMountInteractivePlayer ? (
            <div className="absolute inset-0">
              <LiveEmbed
                embedKey={performer.feedKey}
                posterUrl={performer.posterUrl}
                embedPlan={performer.embedPlan}
                isActive={true}
                isArmed={true}
                sessionMuted={true}
              />
            </div>
          ) : (
            <>
              {preview ? (
                <Image
                  src={preview}
                  alt={`${name} live preview`}
                  fill
                  className="object-cover"
                  unoptimized
                  sizes="60vw"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/30" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="inline-flex rounded-md bg-[#39FF14] px-2 py-1 text-[10px] font-black uppercase tracking-wide text-black">
                  Preview
                </span>
                <p className="mt-2 text-sm text-zinc-300">
                  You&apos;re browsing the catalog freely. Start the full HD
                  stream when you&apos;re ready.
                </p>
              </div>
            </>
          )}
        </div>

        <aside className="flex w-full max-w-sm flex-col border-l border-zinc-800 bg-zinc-900/95 p-6">
          <p className="pr-8 text-xl font-black text-white">{name}</p>
          <p className="mt-1 text-sm text-zinc-400">
            ★ {rating.toFixed(1)} · Live now
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={startStream}
              className="flex w-full items-center justify-between rounded-xl bg-[#39FF14] px-4 py-3.5 text-sm font-extrabold text-black shadow-[0_0_24px_rgba(57,255,20,0.35)] transition hover:brightness-110"
            >
              Watch full live stream
              <span aria-hidden>→</span>
            </button>

            <a
              href={affiliateUrl}
              target="_blank"
              rel="nofollow noopener"
              onClick={openChat}
              className="flex w-full items-center justify-between rounded-xl border border-[#39FF14]/40 bg-zinc-950 px-4 py-3.5 text-sm font-bold text-white transition hover:border-[#39FF14] hover:ring-1 hover:ring-[#39FF14]/30"
            >
              Open chat
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
                className="flex w-full items-center justify-between rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3.5 text-sm font-semibold text-zinc-200 transition hover:border-[#39FF14]/40"
              >
                Interactive toy control
                <span aria-hidden>🎮</span>
              </button>
            ) : null}
          </div>

          {profilePath ? (
            <Link
              href={profilePath}
              onClick={handleClose}
              className="mt-6 text-center text-xs font-semibold text-zinc-500 transition hover:text-[#39FF14]"
            >
              View profile & gallery (free)
            </Link>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
