"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AffiliateOutboundLink } from "@/components/conversion/AffiliateOutboundLink";
import { ChatWithModelCta } from "@/components/conversion/ChatWithModelCta";
import { DesktopLivePlayerShell } from "@/components/desktop/DesktopLivePlayerShell";
import { useConversionAttentionPulse } from "@/hooks/useConversionAttentionPulse";
import {
  performerDisplayTags,
  performerShortBio,
} from "@/lib/desktop/performerCatalogMeta";
import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import { buildJerkmateAffiliateUrl } from "@/lib/crackrevenue/jerkmateAffiliate";
import { performerProfilePathFromPerformer } from "@/lib/profile/performerHandle";
import {
  setFeedEmbedIframeAudible,
  getFeedPlayerIframeForKey,
} from "@/lib/feed/liveIframeAudio";

type ExploreDesktopTheaterModalProps = {
  performers: FeedPerformer[];
  activeIndex: number;
  onClose: () => void;
  onChangeIndex: (index: number) => void;
};

export function ExploreDesktopTheaterModal({
  performers,
  activeIndex,
  onClose,
  onChangeIndex,
}: ExploreDesktopTheaterModalProps) {
  const performer = performers[activeIndex] ?? null;
  const [sessionMuted, setSessionMuted] = useState(true);
  const attentionPulse = useConversionAttentionPulse(Boolean(performer));

  const goNext = useCallback(() => {
    if (performers.length === 0) return;
    onChangeIndex((activeIndex + 1) % performers.length);
  }, [activeIndex, onChangeIndex, performers.length]);

  const goPrev = useCallback(() => {
    if (performers.length === 0) return;
    onChangeIndex((activeIndex - 1 + performers.length) % performers.length);
  }, [activeIndex, onChangeIndex, performers.length]);

  const toggleMute = useCallback(() => {
    if (!performer) return;
    const next = !sessionMuted;
    setSessionMuted(next);
    const iframe = getFeedPlayerIframeForKey(performer.feedKey);
    setFeedEmbedIframeAudible(iframe, !next, performer.embedPlan, "gesture");
  }, [performer, sessionMuted]);

  useEffect(() => {
    if (!performer) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
        return;
      }
      if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
        return;
      }
      if (event.key === "m" || event.key === "M") {
        event.preventDefault();
        toggleMute();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [performer, onClose, goNext, goPrev, toggleMute]);

  useEffect(() => {
    setSessionMuted(true);
  }, [performer?.feedKey]);

  if (!performer) return null;

  const name = performer.nameClean || performer.name || "Model";
  const profilePath = performerProfilePathFromPerformer(performer);
  const affiliateUrl = buildJerkmateAffiliateUrl(performer);
  const tags = performerDisplayTags(performer);
  const related = performers
    .filter((p) => p.feedKey !== performer.feedKey)
    .slice(0, 6);

  return (
    <div className="fixed inset-0 z-[100005] hidden items-center justify-center p-4 lg:flex">
      <button
        type="button"
        aria-label="Close theater"
        className="absolute inset-0 bg-zinc-950/85 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${name} live theater`}
        className="relative z-10 flex h-[min(92vh,920px)] w-full max-w-[1400px] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl ring-1 ring-[#39FF14]/15"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute left-4 top-4 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900/90 text-zinc-300 ring-1 ring-zinc-700 transition hover:text-white"
          aria-label="Close"
        >
          &times;
        </button>

        <div className="relative min-h-0 min-w-0 flex-[1.2] bg-black">
          <DesktopLivePlayerShell
            performer={performer}
            fillParent
            sessionMuted={sessionMuted}
          />
        </div>

        <aside className="flex w-full max-w-[380px] shrink-0 flex-col overflow-y-auto border-l border-zinc-800 bg-zinc-900/98 p-5">
          <p className="pr-8 text-xl font-black text-white">{name}</p>
          <p className="mt-1 text-xs text-zinc-500">
            ↑↓←→ switch · M mute · Esc close
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.slice(0, 8).map((tag) => (
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

          <div className="mt-5">
            <ChatWithModelCta
              modelName={name}
              affiliateUrl={affiliateUrl}
              visible
              attentionPulse={attentionPulse}
              className="w-full max-w-none"
            />
          </div>

          <AffiliateOutboundLink
            href={affiliateUrl}
            className="mt-2 flex w-full items-center justify-between rounded-xl border border-[#39FF14]/40 bg-zinc-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-[#39FF14]/10"
          >
            Open private room
            <span aria-hidden>→</span>
          </AffiliateOutboundLink>

          {profilePath ? (
            <Link
              href={profilePath}
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-zinc-700 px-4 py-3 text-sm font-bold text-white transition hover:border-[#39FF14]/50 hover:text-[#39FF14]"
            >
              Full profile & gallery →
            </Link>
          ) : null}

          {related.length > 0 ? (
            <div className="mt-6 border-t border-zinc-800 pt-4">
              <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                More like this
              </p>
              <ul className="mt-3 space-y-2">
                {related.map((item) => {
                  const path = performerProfilePathFromPerformer(item);
                  const label = item.nameClean || item.name || "Model";
                  return (
                    <li key={item.feedKey}>
                      <button
                        type="button"
                        onClick={() => {
                          const idx = performers.findIndex(
                            (p) => p.feedKey === item.feedKey,
                          );
                          if (idx >= 0) onChangeIndex(idx);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg bg-zinc-950/80 p-2 text-left ring-1 ring-zinc-800 transition hover:ring-[#39FF14]/35"
                      >
                        <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded-md bg-zinc-800">
                          <Image
                            src={item.posterUrl}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized
                            sizes="36px"
                          />
                        </div>
                        <span className="truncate text-xs font-semibold text-zinc-200">
                          {label}
                        </span>
                      </button>
                      {path ? (
                        <Link
                          href={path}
                          className="mt-1 block text-[10px] font-semibold text-zinc-500 hover:text-[#39FF14]"
                        >
                          View profile
                        </Link>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
