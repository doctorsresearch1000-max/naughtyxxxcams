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
  adoptInCardStreamSlot,
  claimStreamForStage,
  ensureStreamWarming,
  isStreamSlotLoaded,
  peekStreamSlot,
  refreshStreamStageLayout,
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

function wireIframeChrome(
  iframe: HTMLIFrameElement,
  slideHeightPx: number,
  isActive: boolean,
  streamPriority: StreamLoadPriority,
  embedPlan: PerformerEmbedPlan,
  embedKey: string,
): void {
  applyStreamIframeStagePresentation(iframe, slideHeightPx, isActive);
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
  const attachGenRef = useRef(0);
  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;
  const [frameLoaded, setFrameLoaded] = useState(() =>
    isStreamSlotLoaded(embedKey),
  );
  const [streamPaintReady, setStreamPaintReady] = useState(false);
  const [usingEngineSlot, setUsingEngineSlot] = useState(false);

  const initialSrc = embedPlan.playerSrcMuted ?? embedPlan.outerEmbedSrc;

  const mountIframe =
    isArmed &&
    embedPlan.canMountInteractivePlayer &&
    Boolean(initialSrc);

  const warmInDock = mountIframe && isHiddenPrefetch && !isActive;

  const posterPriority =
    streamPriority === "high" || isActive || isArmed || isHiddenPrefetch;

  const streamRevealed = isActive && mountIframe && streamPaintReady;
  const audible = isActive && !sessionMuted;
  const posterFadeMs =
    fastReveal || streamPriority === "high" ? 120 : streamRevealed ? 180 : 0;

  const markFrameLoaded = useCallback(() => {
    setFrameLoaded(true);
    if (isActiveRef.current) {
      setStreamPaintReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isActive || !mountIframe) {
      setStreamPaintReady(false);
      return;
    }

    const docReady = frameLoaded || isStreamSlotLoaded(embedKey);

    let settleTimeoutId: number | undefined;
    const revealPaint = () => {
      if (settleTimeoutId !== undefined) {
        window.clearTimeout(settleTimeoutId);
        settleTimeoutId = undefined;
      }
      setStreamPaintReady(true);
    };

    const onMessage = (event: MessageEvent) => {
      const iframe = iframeRef.current;
      if (!iframe?.contentWindow || event.source !== iframe.contentWindow) {
        return;
      }
      const data = event.data as { source?: string; action?: string };
      if (data?.source === "naughty-embed" && data?.action === "stream-active") {
        revealPaint();
      }
    };

    window.addEventListener("message", onMessage);

    if (docReady) {
      settleTimeoutId = window.setTimeout(revealPaint, 1800);
    }

    return () => {
      window.removeEventListener("message", onMessage);
      if (settleTimeoutId !== undefined) {
        window.clearTimeout(settleTimeoutId);
      }
    };
  }, [isActive, mountIframe, embedKey, frameLoaded]);

  const parkIframeToDock = useCallback(() => {
    const iframe = iframeRef.current;
    const stage = stageRef.current;
    if (iframe && stage?.contains(iframe) && !peekStreamSlot(embedKey)) {
      adoptInCardStreamSlot(
        embedKey,
        initialSrc!,
        iframe,
        frameLoaded || isStreamSlotLoaded(embedKey),
      );
    }
    if (peekStreamSlot(embedKey)) {
      releaseStreamSlot(embedKey, true);
    }
    iframeRef.current = null;
    setUsingEngineSlot(false);
  }, [embedKey, initialSrc, frameLoaded]);

  useEffect(() => {
    setFrameLoaded(isStreamSlotLoaded(embedKey));
    setUsingEngineSlot(false);
    iframeRef.current = null;
  }, [embedKey, initialSrc]);

  useLayoutEffect(() => {
    if (!initialSrc || !embedPlan.canMountInteractivePlayer || !mountIframe) {
      return;
    }

    const gen = ++attachGenRef.current;

    const attachToStage = (forActive: boolean) => {
      if (attachGenRef.current !== gen) return;

      const stage = stageRef.current;
      if (!stage) {
        requestAnimationFrame(() => attachToStage(forActive));
        return;
      }

      const claimed = claimStreamForStage(embedKey, stage, (iframe) => {
        wireIframeChrome(
          iframe,
          slideHeightPx,
          forActive,
          streamPriority,
          embedPlan,
          embedKey,
        );
      });

      if (claimed) {
        iframeRef.current = claimed.iframe;
        setUsingEngineSlot(true);
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
        wireIframeChrome(
          iframeRef.current,
          slideHeightPx,
          forActive,
          streamPriority,
          embedPlan,
          embedKey,
        );
        if (isStreamSlotLoaded(embedKey)) {
          markFrameLoaded();
        }
        return;
      }

      if (peekStreamSlot(embedKey)) {
        requestAnimationFrame(() => attachToStage(forActive));
        return;
      }

      const iframe = document.createElement("iframe");
      iframe.src = initialSrc;
      iframe.allow = WIDGET_IFRAME_ALLOW;
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      iframe.addEventListener("load", markFrameLoaded, { once: true });
      stage.appendChild(iframe);
      void stage.offsetHeight;
      wireIframeChrome(
        iframe,
        slideHeightPx,
        forActive,
        streamPriority,
        embedPlan,
        embedKey,
      );
      adoptInCardStreamSlot(embedKey, initialSrc, iframe, false);
      iframeRef.current = iframe;
      setUsingEngineSlot(false);
    };

    if (warmInDock) {
      ensureStreamWarming(embedKey, initialSrc);
      if (isStreamSlotLoaded(embedKey)) {
        markFrameLoaded();
      }
      return;
    }

    if (!isActive) {
      parkIframeToDock();
      return;
    }

    attachToStage(true);
  }, [
    embedKey,
    initialSrc,
    embedPlan,
    mountIframe,
    warmInDock,
    isActive,
    slideHeightPx,
    streamPriority,
    markFrameLoaded,
    parkIframeToDock,
  ]);

  useEffect(() => {
    if (!mountIframe) {
      releaseStreamSlot(embedKey, false);
      iframeRef.current = null;
      onIframeWindow?.(null);
    }
  }, [mountIframe, embedKey, onIframeWindow]);

  useLayoutEffect(() => {
    if (!isActive || !mountIframe) return;
    const iframe = iframeRef.current;
    if (iframe) {
      wireIframeChrome(
        iframe,
        slideHeightPx,
        true,
        streamPriority,
        embedPlan,
        embedKey,
      );
      return;
    }
    refreshStreamStageLayout(embedKey, slideHeightPx, true);
  }, [isActive, mountIframe, slideHeightPx, streamPriority, embedPlan, embedKey]);

  useEffect(() => {
    if (!isActive) {
      onIframeWindow?.(null);
      return;
    }
    if (!frameLoaded) return;
    onIframeWindow?.(iframeRef.current?.contentWindow ?? null);
  }, [isActive, frameLoaded, onIframeWindow]);

  const rootStyle = feedEmbedRootStyle(slideHeightPx);
  const posterStyle = feedPosterImageStyle(slideHeightPx);

  const stageStyle: CSSProperties = {
    ...feedEmbedStageStyle(slideHeightPx),
    zIndex: 1,
    opacity: isActive ? 1 : 0,
    visibility: isActive ? "visible" : "hidden",
    pointerEvents: "none",
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
      data-feed-layout-v="16"
      data-engine-slot={usingEngineSlot ? "1" : "0"}
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
