"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  claimWarmStreamIframe,
  peekWarmStream,
} from "@/lib/feed/streamEmbedWarmup";
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

export type StreamLoadPriority = "high" | "low" | "auto";

type LiveEmbedProps = {
  embedKey: string;
  posterUrl: string;
  embedPlan: PerformerEmbedPlan;
  isActive: boolean;
  isArmed: boolean;
  /** Armed but not active — mount full-size iframe under poster (N+1 warm prerender). */
  isHiddenPrefetch?: boolean;
  sessionMuted: boolean;
  streamPriority?: StreamLoadPriority;
  viewportHeightPx?: number;
  fastReveal?: boolean;
  onIframeWindow?: (win: Window | null) => void;
};

function destroyEmbedIframe(iframe: HTMLIFrameElement | null): void {
  if (!iframe) return;
  try {
    iframe.src = "";
    iframe.removeAttribute("src");
  } catch {
    /* cross-origin */
  }
  iframe.remove();
}

function applyIframeChrome(
  iframe: HTMLIFrameElement,
  slideHeightPx: number,
  isActive: boolean,
  streamPriority: StreamLoadPriority,
  embedPlan: PerformerEmbedPlan,
  embedKey: string,
): void {
  iframe.className = `feed-embed-iframe ${
    isActive ? "pointer-events-auto" : "pointer-events-none"
  }`;
  Object.assign(iframe.style, feedEmbedIframeStyle(slideHeightPx));
  iframe.setAttribute("data-naughty-feed-embed", "true");
  iframe.setAttribute("data-player-src-muted", embedPlan.playerSrcMuted ?? "");
  iframe.setAttribute(
    "data-player-src-unmuted",
    embedPlan.playerSrcUnmuted ?? "",
  );
  iframe.title = `Live stream ${embedKey}`;
  if (streamPriority === "high") {
    iframe.setAttribute("fetchpriority", "high");
  }
}

/**
 * Cross-origin Streamate surface. Prefetch slides keep a full-size hidden iframe
 * loading under the poster so scroll reveals are instant.
 */
export function LiveEmbed({
  embedKey,
  posterUrl,
  embedPlan,
  isActive,
  isArmed,
  isHiddenPrefetch = false,
  sessionMuted,
  streamPriority = "auto",
  viewportHeightPx,
  fastReveal = false,
  onIframeWindow,
}: LiveEmbedProps) {
  const contextHeightPx = useFeedSlideHeightPx();
  const slideHeightPx = viewportHeightPx ?? contextHeightPx;
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [frameLoaded, setFrameLoaded] = useState(false);
  const [claimedWarm, setClaimedWarm] = useState(false);

  const initialSrc = embedPlan.playerSrcMuted ?? embedPlan.outerEmbedSrc;

  const mountIframe =
    isArmed &&
    embedPlan.canMountInteractivePlayer &&
    Boolean(initialSrc);

  const posterPriority =
    streamPriority === "high" || isActive || isArmed || isHiddenPrefetch;

  const streamRevealed = isActive && frameLoaded && mountIframe;
  const audible = isActive && !sessionMuted;
  const posterFadeMs =
    fastReveal || streamPriority === "high" ? 120 : streamRevealed ? 180 : 0;

  useEffect(() => {
    setFrameLoaded(false);
    setClaimedWarm(false);
  }, [embedKey, initialSrc]);

  useEffect(() => {
    if (mountIframe) return;
    const iframe = iframeRef.current;
    destroyEmbedIframe(iframe);
    iframeRef.current = null;
    setFrameLoaded(false);
    setClaimedWarm(false);
    onIframeWindow?.(null);
  }, [mountIframe, onIframeWindow]);

  useEffect(() => {
    return () => {
      destroyEmbedIframe(iframeRef.current);
      iframeRef.current = null;
    };
  }, []);

  const markFrameLoaded = useCallback(() => {
    setFrameLoaded(true);
  }, []);

  useLayoutEffect(() => {
    if (!mountIframe || !initialSrc) return;

    const stage = stageRef.current;
    if (!stage) return;

    if (iframeRef.current && stage.contains(iframeRef.current)) {
      return;
    }

    const warm = peekWarmStream(embedKey) ? claimWarmStreamIframe(embedKey) : null;
    if (!warm) return;

    const iframe = warm.iframe;
    applyIframeChrome(
      iframe,
      slideHeightPx,
      isActive,
      streamPriority,
      embedPlan,
      embedKey,
    );

    stage.appendChild(iframe);
    iframeRef.current = iframe;
    setClaimedWarm(true);

    if (warm.loaded) {
      markFrameLoaded();
    } else {
      iframe.addEventListener("load", markFrameLoaded, { once: true });
    }
  }, [
    embedKey,
    mountIframe,
    initialSrc,
    isActive,
    slideHeightPx,
    embedPlan,
    streamPriority,
    markFrameLoaded,
  ]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    iframe.className = `feed-embed-iframe ${
      isActive ? "pointer-events-auto" : "pointer-events-none"
    }`;
  }, [isActive]);

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

    if (!isActive || sessionMuted) {
      setFeedEmbedIframeAudible(iframe, false, embedPlan);
    }
    /* Unmute only inside user-gesture handlers — never reload unmuted src here. */
  }, [isActive, sessionMuted, frameLoaded, mountIframe, embedPlan, embedKey]);

  const bindIframeRef = useCallback((node: HTMLIFrameElement | null) => {
    iframeRef.current = node;
  }, []);

  const rootStyle = feedEmbedRootStyle(slideHeightPx);
  const posterStyle = feedPosterImageStyle(slideHeightPx);

  const stageStyle: CSSProperties = {
    ...feedEmbedStageStyle(slideHeightPx),
    zIndex: 1,
    opacity: streamRevealed ? 1 : 0,
    visibility: mountIframe ? "visible" : "hidden",
    transition: streamRevealed
      ? `opacity ${posterFadeMs}ms ease-out`
      : "none",
    pointerEvents: isActive && streamRevealed ? "auto" : "none",
  };

  const posterStyleWithFade: CSSProperties = {
    ...posterStyle,
    zIndex: 2,
    opacity: streamRevealed ? 0 : 1,
    transition: streamRevealed
      ? `opacity ${posterFadeMs}ms ease-out`
      : "none",
  };

  const posterClass = "feed-embed-poster";

  if (!isArmed || !embedPlan.canMountInteractivePlayer) {
    return (
      <div className="feed-embed-root" style={rootStyle}>
        <FeedPoster
          feedKey={embedKey}
          posterUrl={posterUrl}
          priority={posterPriority}
          className={posterClass}
          style={posterStyleWithFade}
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
      data-feed-prefetch={isHiddenPrefetch ? "1" : "0"}
      data-feed-audible={audible ? "1" : "0"}
      data-stream-revealed={streamRevealed ? "1" : "0"}
      data-feed-key={embedKey}
      data-embed-mode={embedPlan.mode}
      data-feed-layout-v="4"
    >
      <FeedPoster
        feedKey={embedKey}
        posterUrl={posterUrl}
        priority={posterPriority}
        className={`pointer-events-none ${posterClass}`}
        style={posterStyleWithFade}
      />

      {mountIframe && initialSrc ? (
        <div
          ref={stageRef}
          className="feed-embed-stage"
          style={stageStyle}
          aria-hidden={!isActive}
        >
          {!claimedWarm ? (
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
              loading="eager"
              // @ts-expect-error — Chromium / Safari 17+ fetch priority hint
              fetchPriority={
                streamPriority === "high"
                  ? "high"
                  : isHiddenPrefetch
                    ? "low"
                    : "auto"
              }
              onLoad={markFrameLoaded}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
