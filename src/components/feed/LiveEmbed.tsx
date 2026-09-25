"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FeedPoster } from "@/components/feed/FeedPoster";
import { useFeedSlideHeightPx } from "@/components/feed/FeedViewportContext";
import {
  feedEmbedIframeStyle,
  feedEmbedRootStyle,
  feedEmbedStageStyle,
  feedPosterImageStyle,
} from "@/components/feed/feedPlayerStyles";
import type { PerformerEmbedPlan } from "@/lib/feed/performerEmbed";
import { WIDGET_IFRAME_ALLOW } from "@/lib/feed/embedFrame";
import { setFeedEmbedIframeAudible } from "@/lib/feed/liveIframeAudio";

type LiveEmbedProps = {
  embedKey: string;
  posterUrl: string;
  embedPlan: PerformerEmbedPlan;
  isActive: boolean;
  isArmed: boolean;
  sessionMuted: boolean;
  /** Overrides feed viewport height (desktop player shells). */
  viewportHeightPx?: number;
  onIframeWindow?: (win: Window | null) => void;
};

/**
 * Clean cross-origin player surface — no parent capture handlers, no affiliate overlays.
 * Audio unlock is handled inside the Crak document when the user taps the video.
 */
export function LiveEmbed({
  embedKey,
  posterUrl,
  embedPlan,
  isActive,
  isArmed,
  sessionMuted,
  viewportHeightPx,
  onIframeWindow,
}: LiveEmbedProps) {
  const contextHeightPx = useFeedSlideHeightPx();
  const slideHeightPx = viewportHeightPx ?? contextHeightPx;
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [frameLoaded, setFrameLoaded] = useState(false);

  const initialSrc = embedPlan.playerSrcMuted ?? embedPlan.outerEmbedSrc;

  const mountIframe =
    isArmed &&
    embedPlan.canMountInteractivePlayer &&
    Boolean(initialSrc);

  useEffect(() => {
    setFrameLoaded(false);
  }, [embedKey, initialSrc]);

  useEffect(() => {
    if (!isActive) {
      onIframeWindow?.(null);
      return;
    }
    if (!frameLoaded) return;
    onIframeWindow?.(iframeRef.current?.contentWindow ?? null);
  }, [isActive, frameLoaded, onIframeWindow]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !frameLoaded || !mountIframe) return;

    if (!isActive) {
      setFeedEmbedIframeAudible(iframe, false, embedPlan);
      return;
    }

    const wantSound = !sessionMuted;
    setFeedEmbedIframeAudible(iframe, wantSound, embedPlan);
  }, [
    isActive,
    sessionMuted,
    frameLoaded,
    mountIframe,
    embedPlan,
    embedKey,
  ]);

  const streamRevealed = isActive && frameLoaded && mountIframe;
  const audible = isActive && !sessionMuted;
  const hidePoster = frameLoaded && mountIframe;

  const bindIframeRef = useCallback((node: HTMLIFrameElement | null) => {
    iframeRef.current = node;
  }, []);

  const rootStyle = feedEmbedRootStyle(slideHeightPx);
  const posterStyle = feedPosterImageStyle(slideHeightPx);
  const posterClass = `feed-embed-poster transition-opacity duration-500 ease-out ${
    hidePoster ? "opacity-0" : "opacity-100"
  }`;

  if (!isArmed || !embedPlan.canMountInteractivePlayer) {
    return (
      <div className="feed-embed-root" style={rootStyle}>
        <FeedPoster
          feedKey={embedKey}
          posterUrl={posterUrl}
          priority={isActive || isArmed}
          className={posterClass}
          style={posterStyle}
        />
      </div>
    );
  }

  return (
    <div
      className="feed-embed-root"
      style={rootStyle}
      data-feed-card-root="true"
      data-feed-active={isActive ? "1" : "0"}
      data-feed-audible={audible ? "1" : "0"}
      data-stream-revealed={streamRevealed ? "1" : "0"}
      data-feed-key={embedKey}
      data-embed-mode={embedPlan.mode}
      data-feed-layout-v="3"
    >
      <FeedPoster
        feedKey={embedKey}
        posterUrl={posterUrl}
        priority={isActive || isArmed}
        className={`pointer-events-none ${posterClass}`}
        style={posterStyle}
      />

      {mountIframe && initialSrc ? (
        <div
          className="feed-embed-stage"
          style={feedEmbedStageStyle(slideHeightPx)}
        >
          <iframe
            key={`${embedKey}-${embedPlan.mode}`}
            ref={bindIframeRef}
            src={initialSrc}
            title={`Live stream ${embedKey}`}
            data-naughty-feed-embed="true"
            data-player-src-muted={embedPlan.playerSrcMuted ?? ""}
            data-player-src-unmuted={embedPlan.playerSrcUnmuted ?? ""}
            className={`feed-embed-iframe ${
              isActive ? "pointer-events-auto" : "pointer-events-none"
            }`}
            style={feedEmbedIframeStyle(slideHeightPx)}
            allow={WIDGET_IFRAME_ALLOW}
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={() => setFrameLoaded(true)}
          />
        </div>
      ) : null}
    </div>
  );
}
