"use client";

import { memo, useEffect, useMemo, useState } from "react";
import type { FeedPerformer } from "@/lib/feed/filterPerformers";
import { saveContinueWatching } from "@/lib/feed/continueWatchingStorage";
import { useSessionAudio } from "@/components/feed/SessionAudioProvider";
import { FeedActionRail } from "@/components/feed/FeedActionRail";
import { FeedPerformerLink } from "@/components/feed/FeedPerformerLink";
import { useRegisterFeedBottomCta } from "@/components/layout/FeedBottomChromeContext";
import { useDelayedConversionCta } from "@/hooks/useDelayedConversionCta";
import {
  performerDisplayHandle,
  performerProfilePath,
} from "@/lib/profile/performerHandle";
import { LiveStreamBadge } from "@/components/feed/LiveStreamBadge";
import { LiveCommentTicker } from "@/components/feed/LiveCommentTicker";
import { recordView } from "@/lib/user/userLibrary";
import { useFeedSlideHeightPx } from "@/components/feed/FeedViewportContext";
import { feedPlayerMountStyle, feedSlideBoxStyle } from "@/lib/feed/feedPlayerStyles";
import { LiveEmbed, type StreamLoadPriority } from "./LiveEmbed";

type LiveFeedCardProps = {
  performer: FeedPerformer;
  index: number;
  isActive: boolean;
  isArmed: boolean;
  streamPriority?: StreamLoadPriority;
  /** Defer ticker/rail one frame so the embed wins the main thread (LCP). */
  deferSecondaryChrome?: boolean;
  onRegisterIframe: (win: Window | null) => void;
};

function LiveFeedCardInner({
  performer,
  index,
  isActive,
  isArmed,
  streamPriority = "auto",
  deferSecondaryChrome = false,
  onRegisterIframe,
}: LiveFeedCardProps) {
  const slideHeightPx = useFeedSlideHeightPx();
  const { muted, toggleMutedFromUserGesture } = useSessionAudio();
  const onToggleMute = () => {
    toggleMutedFromUserGesture(performer.embedPlan);
  };
  const [secondaryChromeReady, setSecondaryChromeReady] = useState(
    !deferSecondaryChrome,
  );
  const conversionReady = useDelayedConversionCta(isActive, 15_000);
  const conversionCtaVisible = isActive && conversionReady;

  useEffect(() => {
    if (!isActive || !deferSecondaryChrome) {
      setSecondaryChromeReady(!deferSecondaryChrome || isActive);
      return;
    }
    setSecondaryChromeReady(false);
    const id = requestAnimationFrame(() => {
      setSecondaryChromeReady(true);
    });
    return () => cancelAnimationFrame(id);
  }, [isActive, deferSecondaryChrome]);
  const handleLabel = performerDisplayHandle(
    performer.nameClean || performer.name,
  );
  const modelName =
    performer.nameClean || performer.name?.replace(/^@+/, "") || "Model";
  const profileHref = performerProfilePath(
    performer.nameClean || performer.name,
  );
  const affiliateUrl = performer.embedPlan.roomAffiliateUrl;

  useRegisterFeedBottomCta(
    conversionCtaVisible,
    modelName,
    affiliateUrl,
  );

  const modelRef = useMemo(
    () => ({
      feedKey: performer.feedKey,
      nameClean: performer.nameClean,
      name: performer.name,
      posterUrl: performer.posterUrl,
      profilePath: profileHref,
      savedAt: Date.now(),
    }),
    [
      performer.feedKey,
      performer.nameClean,
      performer.name,
      performer.posterUrl,
      profileHref,
    ],
  );

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
    modelRef,
    performer.feedKey,
    performer.nameClean,
    performer.name,
    performer.posterUrl,
  ]);

  return (
    <article
      className="tele-card feed-slide relative z-10 w-full shrink-0 snap-start snap-always overflow-hidden bg-black touch-pan-y"
      style={feedSlideBoxStyle(slideHeightPx)}
      data-slide-index={index}
      data-feed-key={performer.feedKey}
      data-feed-layout-v="3"
      aria-label={handleLabel}
    >
      <div className="feed-player-mount" style={feedPlayerMountStyle(slideHeightPx)}>
        <LiveEmbed
          embedKey={performer.feedKey}
          posterUrl={performer.posterUrl}
          embedPlan={performer.embedPlan}
          isActive={isActive}
          isArmed={isArmed}
          isHiddenPrefetch={isArmed && !isActive}
          sessionMuted={muted}
          streamPriority={streamPriority}
          onIframeWindow={isActive ? onRegisterIframe : undefined}
        />
      </div>

      {secondaryChromeReady ? (
        <LiveStreamBadge
          performer={performer}
          feedKey={performer.feedKey}
          visible={isActive}
        />
      ) : null}

      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[30] h-[min(38%,11rem)] bg-gradient-to-b from-black/45 to-transparent"
        aria-hidden
      />

      <div
        className="pointer-events-none absolute bottom-4 left-3 z-[35] max-w-[calc(100%-5.5rem)] flex flex-col items-start"
        style={{
          paddingBottom: isActive
            ? "var(--feed-bottom-clearance)"
            : "calc(4.5rem + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {secondaryChromeReady ? (
          <LiveCommentTicker performer={performer} isActive={isActive} />
        ) : null}
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
          {!isActive ? (
            <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              Swipe · next model
            </span>
          ) : null}
        </div>
      </div>

      {secondaryChromeReady ? (
        <FeedActionRail
          feedKey={performer.feedKey}
          modelRef={modelRef}
          posterUrl={performer.posterUrl}
          profileLabel={handleLabel}
          profilePath={profileHref}
          modelName={modelName}
          affiliateUrl={affiliateUrl}
          isActive={isActive}
          muted={muted}
          onToggleMute={onToggleMute}
        />
      ) : null}
    </article>
  );
}

export const LiveFeedCard = memo(LiveFeedCardInner);
