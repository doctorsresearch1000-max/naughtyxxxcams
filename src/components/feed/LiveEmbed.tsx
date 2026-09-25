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
  markStreamSlotLoaded,
  peekStreamSlot,
  refreshStreamStageLayout,
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

function readStageHeightPx(
  stage: HTMLElement | null,
  fallbackPx: number,
): number {
  if (!stage) return fallbackPx;
  const rect = stage.getBoundingClientRect().height;
  if (rect >= 8) return Math.round(rect);
  const inline = parseFloat(stage.style.height);
  if (Number.isFinite(inline) && inline >= 8) return Math.round(inline);
  return fallbackPx;
}

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
  const [stageHeightPx, setStageHeightPx] = useState(slideHeightPx);
  const [frameLoaded, setFrameLoaded] = useState(() =>
    isStreamSlotLoaded(embedKey),
  );

  const initialSrc = embedPlan.playerSrcMuted ?? embedPlan.outerEmbedSrc;

  const mountIframe =
    isArmed &&
    embedPlan.canMountInteractivePlayer &&
    Boolean(initialSrc);

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
    setStageHeightPx(slideHeightPx);
  }, [slideHeightPx]);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const measure = () => {
      const h = readStageHeightPx(stage, slideHeightPx);
      setStageHeightPx((prev) => (prev === h ? prev : h));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [slideHeightPx, mountIframe, isActive]);

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

    const attachToStage = () => {
      if (attachGenerationRef.current !== generation) return;

      const stage = stageRef.current;
      if (!stage || !isStageReadyForStream(stage)) {
        requestAnimationFrame(attachToStage);
        return;
      }

      const layoutHeightPx = readStageHeightPx(stage, slideHeightPx);

      const applyLayout = (iframe: HTMLIFrameElement) => {
        applyStreamIframeStagePresentation(iframe, layoutHeightPx, true);
        wireIframeMetadata(iframe, embedPlan, embedKey, streamPriority);
      };

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
    slideHeightPx,
    streamPriority,
    markFrameLoaded,
    detachIframeRef,
  ]);

  useLayoutEffect(() => {
    if (!isActive) return;
    const stage = stageRef.current;
    const layoutHeightPx = readStageHeightPx(stage, stageHeightPx);
    refreshStreamStageLayout(embedKey, layoutHeightPx, true);
    const iframe = iframeRef.current;
    if (iframe) {
      applyStreamIframeStagePresentation(iframe, layoutHeightPx, true);
    }
  }, [isActive, stageHeightPx, slideHeightPx, embedKey]);

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

  const rootStyle = feedEmbedRootStyle(stageHeightPx);
  const posterStyle = feedPosterImageStyle(stageHeightPx);

  const stageStyle: CSSProperties = {
    ...feedEmbedStageStyle(stageHeightPx),
    zIndex: 1,
    opacity: isActive ? 1 : 0,
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
      data-feed-layout-v="8"
      data-feed-slide-height={stageHeightPx}
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
