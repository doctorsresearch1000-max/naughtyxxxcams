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
import { feedPosterFallbackDelayMs } from "@/lib/feed/feedPosterReveal";
import {
  clearPurePlayerDisconnect,
  parsePureDisconnectData,
  parsePurePlayerParentMessage,
  PURE_PLAYER_EVENT_DISCONNECTED,
  recordPurePlayerDisconnect,
} from "@/lib/feed/purePlayerDisconnect";
import {
  ensureFeedEmbedMutedInPlace,
  getFeedPlayerIframeForKey,
  setFeedEmbedIframeAudible,
} from "@/lib/feed/liveIframeAudio";

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
  const [frameLoaded, setFrameLoaded] = useState(() =>
    isStreamSlotLoaded(embedKey),
  );
  /** Poster hidden after bounded fallback — not a first-frame / playing signal. */
  const [posterDismissed, setPosterDismissed] = useState(false);
  const [pureDisconnectReason, setPureDisconnectReason] = useState<
    string | null
  >(null);
  const posterDismissedRef = useRef(false);
  const blockPosterDismissRef = useRef(false);
  const [usingEngineSlot, setUsingEngineSlot] = useState(false);

  const initialSrc = embedPlan.playerSrcMuted ?? embedPlan.outerEmbedSrc;

  const mountIframe =
    isArmed &&
    embedPlan.canMountInteractivePlayer &&
    Boolean(initialSrc);

  const warmInDock = mountIframe && isHiddenPrefetch && !isActive;

  const posterPriority =
    streamPriority === "high" || isActive || isArmed || isHiddenPrefetch;

  const streamRevealed = isActive && mountIframe && posterDismissed;
  const audible = isActive && !sessionMuted;
  const posterFadeMs =
    fastReveal || streamPriority === "high" ? 120 : streamRevealed ? 180 : 0;
  const isPureIframe = embedPlan.mode === "api-iframe";

  /** Iframe document loaded — does NOT mean the stream has painted yet. */
  const markFrameDocumentLoaded = useCallback(() => {
    setFrameLoaded(true);
  }, []);

  useEffect(() => {
    posterDismissedRef.current = posterDismissed;
  }, [posterDismissed]);

  useEffect(() => {
    clearPurePlayerDisconnect(embedKey);
    setPureDisconnectReason(null);
    blockPosterDismissRef.current = false;
  }, [embedKey, initialSrc]);

  useEffect(() => {
    if (!isActive || !mountIframe) {
      setPosterDismissed(false);
      blockPosterDismissRef.current = false;
      return;
    }

    const docReadyAtActivation =
      frameLoaded || isStreamSlotLoaded(embedKey);
    const delayMs = feedPosterFallbackDelayMs(
      docReadyAtActivation,
      fastReveal,
    );

    const fallbackId = window.setTimeout(() => {
      if (blockPosterDismissRef.current) return;
      setPosterDismissed(true);
    }, delayMs);

    return () => {
      window.clearTimeout(fallbackId);
    };
  }, [isActive, mountIframe, embedKey, frameLoaded, fastReveal]);

  useEffect(() => {
    if (!mountIframe || !isPureIframe) return;

    const onMessage = (event: MessageEvent) => {
      const iframe =
        iframeRef.current ?? getFeedPlayerIframeForKey(embedKey);
      if (!iframe?.contentWindow || event.source !== iframe.contentWindow) {
        return;
      }

      const parsed = parsePurePlayerParentMessage(event.data);
      if (!parsed || parsed.name !== PURE_PLAYER_EVENT_DISCONNECTED) {
        return;
      }

      const disconnectData = parsePureDisconnectData(parsed.data);
      if (!disconnectData) return;

      const beforePosterDismissed =
        isActive && !posterDismissedRef.current;

      recordPurePlayerDisconnect(embedKey, disconnectData, {
        beforePosterDismissed,
      });
      setPureDisconnectReason(disconnectData.reason);

      if (beforePosterDismissed) {
        blockPosterDismissRef.current = true;
        setPosterDismissed(false);
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [mountIframe, isPureIframe, embedKey, isActive]);

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
      releaseStreamSlot(embedKey, false);
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
          markFrameDocumentLoaded();
        } else {
          claimed.iframe.addEventListener("load", markFrameDocumentLoaded, {
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
          markFrameDocumentLoaded();
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
      iframe.addEventListener("load", markFrameDocumentLoaded, { once: true });
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
        markFrameDocumentLoaded();
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
    markFrameDocumentLoaded,
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

  useLayoutEffect(() => {
    if (!mountIframe || !embedPlan.canMountInteractivePlayer) return;

    const iframe =
      iframeRef.current ?? getFeedPlayerIframeForKey(embedKey);
    if (!iframe) return;

    if (!isActive) {
      ensureFeedEmbedMutedInPlace(iframe, embedPlan);
      return;
    }

    if (sessionMuted) {
      ensureFeedEmbedMutedInPlace(iframe, embedPlan);
    }
  }, [
    isActive,
    sessionMuted,
    mountIframe,
    embedKey,
    embedPlan,
    frameLoaded,
    usingEngineSlot,
  ]);

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
      data-frame-doc-loaded={frameLoaded ? "1" : "0"}
      data-poster-dismissed={posterDismissed ? "1" : "0"}
      data-pure-disconnected={pureDisconnectReason ?? ""}
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
      {isActive ? (
        <div
          className="feed-swipe-shield"
          aria-hidden
          data-feed-swipe-shield="true"
        />
      ) : null}
    </div>
  );
}
