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
  claimStreamForStage,
  ensureStreamWarming,
  isStreamSlotLoaded,
  isStageReadyForStream,
  peekStreamSlot,
  refreshStreamStageLayout,
  markStreamSlotLoaded,
  registerInCardStreamSlot,
  releaseStreamSlot,
} from "@/lib/feed/feedStreamEngine";
import { applyStreamIframeStagePresentation } from "@/lib/feed/feedStreamPresentation";
import { FeedPoster } from "@/components/feed/FeedPoster";
import { useFeedSlideHeightPx } from "@/components/feed/FeedViewportContext";
import {
  feedEmbedRootStyle,
  feedEmbedStageStyle,
  feedPosterImageStyle,
} from "@/lib/feed/feedPlayerStyles";
import type { PerformerEmbedPlan } from "@/lib/feed/performerEmbed";
import { WIDGET_IFRAME_ALLOW } from "@/lib/feed/embedFrame";

export type StreamLoadPriority = "high" | "low" | "auto";

type LiveEmbedProps = {
  embedKey: string;
  posterUrl: string;
  embedPlan: PerformerEmbedPlan;
  isActive: boolean;
  isArmed: boolean;
  isHiddenPrefetch?: boolean;
  sessionMuted: boolean;
  streamPriority?: StreamLoadPriority;
  viewportHeightPx?: number;
  fastReveal?: boolean;
  onIframeWindow?: (win: Window | null) => void;
};

function wireIframeMetadata(
  iframe: HTMLIFrameElement,
  embedPlan: PerformerEmbedPlan,
  embedKey: string,
  streamPriority: StreamLoadPriority,
): void {
  iframe.removeAttribute("data-nx-stream-slot");
  iframe.setAttribute("data-naughty-feed-embed", "true");
  iframe.setAttribute("data-player-src-muted", embedPlan.playerSrcMuted ?? "");
  iframe.setAttribute(
    "data-player-src-unmuted",
    embedPlan.playerSrcUnmuted ?? "",
  );
  iframe.title = `Live stream ${embedKey}`;
  iframe.setAttribute("loading", "eager");
  if (streamPriority === "high") {
    iframe.setAttribute("fetchpriority", "high");
  }
}

/**
 * Active slide: iframe in a stable in-card stage (100% of slide box).
 * N±1 prefetch uses the viewport dock; claim reparents without src change.
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
  const stageRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const attachGenerationRef = useRef(0);
  const [frameLoaded, setFrameLoaded] = useState(() =>
    isStreamSlotLoaded(embedKey),
  );

  const initialSrc = embedPlan.playerSrcMuted ?? embedPlan.outerEmbedSrc;

  const mountIframe =
    isArmed &&
    embedPlan.canMountInteractivePlayer &&
    Boolean(initialSrc);

  const showStage = mountIframe && isActive;

  const posterPriority =
    streamPriority === "high" || isActive || isArmed || isHiddenPrefetch;

  const streamRevealed =
    isActive &&
    mountIframe &&
    (frameLoaded || isStreamSlotLoaded(embedKey));
  const audible = isActive && !sessionMuted;
  const posterFadeMs =
    fastReveal || streamPriority === "high" ? 120 : streamRevealed ? 180 : 0;

  const markFrameLoaded = useCallback(() => {
    setFrameLoaded(true);
  }, []);

  const detachIframeRef = useCallback(() => {
    iframeRef.current = null;
  }, []);

  useEffect(() => {
    setFrameLoaded(isStreamSlotLoaded(embedKey));
    detachIframeRef();
  }, [embedKey, initialSrc, detachIframeRef]);

  useLayoutEffect(() => {
    if (!mountIframe || !initialSrc) return;

    if (isHiddenPrefetch && !isActive) {
      ensureStreamWarming(embedKey, initialSrc);
      return;
    }

    if (!isActive) {
      if (peekStreamSlot(embedKey)) {
        releaseStreamSlot(embedKey, true);
      }
      detachIframeRef();
      return;
    }

    const generation = ++attachGenerationRef.current;

    const applyLayout = (iframe: HTMLIFrameElement) => {
      applyStreamIframeStagePresentation(iframe, true);
      wireIframeMetadata(iframe, embedPlan, embedKey, streamPriority);
    };

    const attachToStage = () => {
      if (attachGenerationRef.current !== generation) return;

      const stage = stageRef.current;
      if (!stage || !isStageReadyForStream(stage)) {
        requestAnimationFrame(attachToStage);
        return;
      }

      const claimed = claimStreamForStage(embedKey, stage, applyLayout);
      if (claimed) {
        iframeRef.current = claimed.iframe;
        if (claimed.loaded) {
          markFrameLoaded();
        } else {
          claimed.iframe.addEventListener("load", markFrameLoaded, {
            once: true,
          });
        }
        return;
      }

      if (iframeRef.current && stage.contains(iframeRef.current)) {
        applyLayout(iframeRef.current);
        return;
      }

      if (peekStreamSlot(embedKey)) {
        requestAnimationFrame(attachToStage);
        return;
      }

      const iframe = document.createElement("iframe");
      iframe.src = initialSrc;
      iframe.allow = WIDGET_IFRAME_ALLOW;
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      stage.appendChild(iframe);
      void stage.offsetHeight;
      applyLayout(iframe);
      registerInCardStreamSlot(embedKey, initialSrc, iframe, false);
      iframe.addEventListener(
        "load",
        () => {
          markStreamSlotLoaded(embedKey);
          markFrameLoaded();
        },
        { once: true },
      );
      iframeRef.current = iframe;
    };

    attachToStage();
  }, [
    mountIframe,
    initialSrc,
    isActive,
    isHiddenPrefetch,
    embedKey,
    embedPlan,
    streamPriority,
    markFrameLoaded,
    detachIframeRef,
  ]);

  useLayoutEffect(() => {
    if (!isActive) return;
    refreshStreamStageLayout(embedKey, true);
    const iframe = iframeRef.current;
    if (iframe) {
      applyStreamIframeStagePresentation(iframe, true);
    }
  }, [isActive, slideHeightPx, embedKey]);

  useEffect(() => {
    if (!mountIframe) {
      releaseStreamSlot(embedKey, false);
      detachIframeRef();
      onIframeWindow?.(null);
    }
  }, [mountIframe, embedKey, onIframeWindow, detachIframeRef]);

  useEffect(() => {
    if (!isActive) {
      onIframeWindow?.(null);
      return;
    }
    if (!frameLoaded || !iframeRef.current) return;
    onIframeWindow?.(iframeRef.current.contentWindow ?? null);
  }, [isActive, frameLoaded, onIframeWindow]);

  const rootStyle = feedEmbedRootStyle(slideHeightPx);
  const posterStyle = feedPosterImageStyle(slideHeightPx);

  const stageStyle: CSSProperties = {
    ...feedEmbedStageStyle(slideHeightPx),
    zIndex: 1,
    opacity: showStage ? 1 : 0,
    pointerEvents: streamRevealed ? "auto" : "none",
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

  if (!mountIframe) {
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
      data-feed-layout-v="7"
      data-feed-slide-height={slideHeightPx}
    >
      <FeedPoster
        feedKey={embedKey}
        posterUrl={posterUrl}
        priority={posterPriority}
        className={`pointer-events-none ${posterClass}`}
        style={posterStyleWithFade}
      />

      <div
        ref={stageRef}
        className="feed-embed-stage"
        style={stageStyle}
        aria-hidden={!isActive}
      />
    </div>
  );
}
