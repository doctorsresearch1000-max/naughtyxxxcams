"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
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
  sessionMuted: boolean;
  streamPriority?: StreamLoadPriority;
  /** Overrides feed viewport height (desktop player shells). */
  viewportHeightPx?: number;
  /** Faster poster handoff when iframe was pre-warmed on hover. */
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
    streamPriority === "high" || isActive || isArmed;

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
    iframe.className = `feed-embed-iframe ${
      isActive ? "pointer-events-auto" : "pointer-events-none"
    }`;
    Object.assign(iframe.style, feedEmbedIframeStyle(slideHeightPx));
    iframe.setAttribute("data-naughty-feed-embed", "true");
    iframe.setAttribute(
      "data-player-src-muted",
      embedPlan.playerSrcMuted ?? "",
    );
    iframe.setAttribute(
      "data-player-src-unmuted",
      embedPlan.playerSrcUnmuted ?? "",
    );
    iframe.title = `Live stream ${embedKey}`;
    if (streamPriority === "high") {
      iframe.setAttribute("fetchpriority", "high");
    }

    stage.appendChild(iframe);
    iframeRef.current = iframe;
    setClaimedWarm(true);

    if (warm.loaded) {
      setFrameLoaded(true);
    } else {
      iframe.addEventListener("load", () => setFrameLoaded(true), {
        once: true,
      });
    }
  }, [
    embedKey,
    mountIframe,
    initialSrc,
    isActive,
    slideHeightPx,
    embedPlan.playerSrcMuted,
    embedPlan.playerSrcUnmuted,
    streamPriority,
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
  const posterFadeMs = fastReveal || streamPriority === "high" ? 120 : 500;
  const posterClass = `feed-embed-poster ease-out ${
    hidePoster ? "opacity-0" : "opacity-100"
  }`;
  const posterStyleWithFade = {
    ...posterStyle,
    transition: `opacity ${posterFadeMs}ms ease-out`,
  };

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
      data-feed-audible={audible ? "1" : "0"}
      data-stream-revealed={streamRevealed ? "1" : "0"}
      data-feed-key={embedKey}
      data-embed-mode={embedPlan.mode}
      data-feed-layout-v="3"
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
          style={feedEmbedStageStyle(slideHeightPx)}
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
              // @ts-expect-error — priority hint for LCP slide (Chromium / Safari 17+)
              fetchPriority={streamPriority === "high" ? "high" : "auto"}
              onLoad={() => setFrameLoaded(true)}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
