"use client";

import { useEffect } from "react";
import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import { saveContinueWatching } from "@/lib/feed/continueWatchingStorage";
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
import { LiveCommentTicker } from "@/components/feed/LiveCommentTicker";
import { recordView } from "@/lib/user/userLibrary";
import { LiveEmbed } from "./LiveEmbed";

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
  const { muted, toggleMutedFromPointerDown } = useSessionAudio();
  const conversionReady = useDelayedConversionCta(isActive, 15_000);
  const handleLabel = performerDisplayHandle(
    performer.nameClean || performer.name,
  );
  const modelName =
    performer.nameClean || performer.name?.replace(/^@+/, "") || "Model";
  const profileHref = performerProfilePath(
    performer.nameClean || performer.name,
  );
  const affiliateUrl = performer.embedPlan.roomAffiliateUrl;
  const modelRef = {
    feedKey: performer.feedKey,
    nameClean: performer.nameClean,
    name: performer.name,
    posterUrl: performer.posterUrl,
    profilePath: profileHref,
    savedAt: Date.now(),
  };

  useEffect(() => {
    if (!isActive) return;
    saveContinueWatching({
      feedKey: performer.feedKey,
      nameClean: performer.nameClean,
      name: performer.name,
      posterUrl: performer.posterUrl,
    });
    recordView(modelRef);
  }, [
    isActive,
    performer.feedKey,
    performer.nameClean,
    performer.name,
    performer.posterUrl,
  ]);

  return (
    <article
      className="tele-card feed-slide"
      data-slide-index={index}
      data-feed-key={performer.feedKey}
      aria-label={handleLabel}
    >
      <div className="feed-player-mount">
        <LiveEmbed
          embedKey={performer.feedKey}
          posterUrl={performer.posterUrl}
          embedPlan={performer.embedPlan}
          isActive={isActive}
          isArmed={isArmed}
          onIframeWindow={isActive ? onRegisterIframe : undefined}
        />
      </div>

      <LiveStreamBadge
        performer={performer}
        feedKey={performer.feedKey}
        visible={isActive}
      />

      <div
        className="pointer-events-none absolute inset-0 z-[30] bg-gradient-to-b from-black/45 via-transparent to-black/75"
        aria-hidden
      />

      <div className="pointer-events-none absolute bottom-4 left-3 z-[35] max-w-[calc(100%-5.5rem)] flex flex-col items-start">
        <LiveCommentTicker performer={performer} isActive={isActive} />
        {profileHref ? (
          <FeedPerformerLink
            href={profileHref}
            ariaLabel={`View profile ${handleLabel}`}
            className="pointer-events-auto inline-block max-w-full text-sm font-extrabold uppercase tracking-wide text-white drop-shadow-md transition hover:text-[#39FF14]"
          >
            {handleLabel}
          </FeedPerformerLink>
        ) : (
          <span className="text-sm font-extrabold uppercase tracking-wide text-white drop-shadow-md">
            {handleLabel}
          </span>
        )}
        <div className="pointer-events-none mt-2 flex w-full max-w-[78%] flex-col gap-2">
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
      </div>

      <FeedActionRail
        feedKey={performer.feedKey}
        modelRef={modelRef}
        posterUrl={performer.posterUrl}
        profileLabel={handleLabel}
        modelName={modelName}
        affiliateUrl={affiliateUrl}
        conversionReady={conversionReady}
        isActive={isActive}
        muted={muted}
        onToggleMute={toggleMutedFromPointerDown}
      />
    </article>
  );
}
