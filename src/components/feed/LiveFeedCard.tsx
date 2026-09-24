"use client";

import { useEffect } from "react";
import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import { saveContinueWatching } from "@/lib/feed/continueWatchingStorage";
import { buildModelAffiliateUrl } from "@/lib/crackrevenue/affiliate";
import { useSessionAudio } from "@/components/feed/SessionAudioProvider";
import { FeedActionRail } from "@/components/feed/FeedActionRail";
import { FeedPerformerLink } from "@/components/feed/FeedPerformerLink";
import { ChatWithModelCta } from "@/components/conversion/ChatWithModelCta";
import { useDelayedConversionCta } from "@/hooks/useDelayedConversionCta";
import {
  performerDisplayHandle,
  performerProfilePath,
} from "@/lib/profile/performerHandle";
import { LiveStreamBadge } from "@/components/feed/LiveStreamBadge";
import { LiveEmbed } from "./LiveEmbed";

const CARD_HEIGHT = "h-[calc(100dvh-4rem)]";

type LiveFeedCardProps = {
  performer: FeedPerformer;
  index: number;
  isActive: boolean;
  isArmed: boolean;
  onRegisterIframe: (win: Window | null) => void;
};

export function LiveFeedCard({
  performer,
  index,
  isActive,
  isArmed,
  onRegisterIframe,
}: LiveFeedCardProps) {
  const { muted, toggleMuted } = useSessionAudio();
  const conversionReady = useDelayedConversionCta(isActive, 15_000);
  const handleLabel = performerDisplayHandle(
    performer.nameClean || performer.name,
  );
  const modelName =
    performer.nameClean || performer.name?.replace(/^@+/, "") || "Model";
  const profileHref = performerProfilePath(
    performer.nameClean || performer.name,
  );
  const affiliateUrl = buildModelAffiliateUrl(performer);

  useEffect(() => {
    if (!isActive) return;
    saveContinueWatching({
      feedKey: performer.feedKey,
      nameClean: performer.nameClean,
      name: performer.name,
      posterUrl: performer.posterUrl,
    });
  }, [
    isActive,
    performer.feedKey,
    performer.nameClean,
    performer.name,
    performer.posterUrl,
  ]);

  return (
    <article
      className={`tele-card relative w-full shrink-0 snap-start overflow-hidden bg-black ${CARD_HEIGHT}`}
      data-slide-index={index}
      data-feed-key={performer.feedKey}
      aria-label={handleLabel}
    >
      <LiveEmbed
        embedKey={performer.feedKey}
        posterUrl={performer.posterUrl}
        performerNameClean={performer.nameClean || performer.name}
        isActive={isActive}
        isArmed={isArmed}
        onIframeWindow={isActive ? onRegisterIframe : undefined}
      />

      <LiveStreamBadge
        performer={performer}
        feedKey={performer.feedKey}
        visible={isActive}
      />

      <div className="pointer-events-none absolute inset-0 z-[30] bg-gradient-to-b from-black/45 via-transparent to-black/75" />

      <div className="pointer-events-none absolute bottom-4 left-4 z-[35] max-w-[78%] flex flex-col gap-2">
        {isActive && (
          <div className="mb-0.5 flex max-w-[220px] items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-xs text-zinc-200 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-[#39FF14]" />
            <span className="truncate">deep_tipper: you look amazing tonight</span>
          </div>
        )}
        {profileHref ? (
          <FeedPerformerLink
            href={profileHref}
            ariaLabel={`View profile ${handleLabel}`}
            className="pointer-events-auto inline-block max-w-full text-sm font-extrabold text-white drop-shadow-md transition hover:text-[#39FF14]"
          >
            {handleLabel}
          </FeedPerformerLink>
        ) : (
          <span className="text-sm font-extrabold text-white drop-shadow-md">
            {handleLabel}
          </span>
        )}
        <ChatWithModelCta
          modelName={modelName}
          affiliateUrl={affiliateUrl}
          visible={isActive && conversionReady}
        />
        {!isActive ? (
          <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
            Swipe · next model
          </span>
        ) : null}
      </div>

      <FeedActionRail
        feedKey={performer.feedKey}
        posterUrl={performer.posterUrl}
        profileHref={profileHref}
        profileLabel={handleLabel}
        modelName={modelName}
        affiliateUrl={affiliateUrl}
        conversionReady={conversionReady}
        isActive={isActive}
        muted={muted}
        onToggleMute={toggleMuted}
      />
    </article>
  );
}
