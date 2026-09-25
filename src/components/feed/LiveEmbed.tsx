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
  isActive: boolean,
  streamPriority: StreamLoadPriority,
  embedPlan: PerformerEmbedPlan,
  embedKey: string,
): void {
  applyStreamIframeStagePresentation(iframe, isActive);
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
  fastReveal = false,
  onIframeWindow,
}: LiveEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const attachGenRef = useRef(0);
  const [frameLoaded, setFrameLoaded] = useState(() =>
    isStreamSlotLoaded(embedKey),
  );
  const [usingEngineSlot, setUsingEngineSlot] = useState(false);

  const initialSrc = embedPlan.playerSrcMuted ?? embedPlan.outerEmbedSrc;

  const mountIframe =
    isArmed &&
    embedPlan.canMountInteractivePlayer &&
    Boolean(initialSrc);

  const warmInDock = mountIframe && isHiddenPrefetch && !isActive;

  const posterPriority =
    streamPriority === "high" || isActive || isArmed || isHiddenPrefetch;

  const streamRevealed =
    isActive &&
    mountIframe &&
    (frameLoaded || isStreamSlotLoaded(embedKey) || usingEngineSlot);
  const audible = isActive && !sessionMuted;
  const posterFadeMs =
    fastReveal || streamPriority === "high" ? 120 : streamRevealed ? 180 : 0;

  const markFrameLoaded = useCallback(() => {
    setFrameLoaded(true);
  }, []);

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

    const gen = ++attachGenRef.current;

    const attachActive = () => {
      if (attachGenRef.current !== gen) return;

      const stage = stageRef.current;
      if (!stage) {
        requestAnimationFrame(attachActive);
        return;
      }

      const claimed = claimStreamForStage(embedKey, stage, (iframe) => {
        wireIframeMetadata(iframe, true, streamPriority, embedPlan, embedKey);
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
        wireIframeMetadata(
          iframeRef.current,
          true,
          streamPriority,
          embedPlan,
          embedKey,
        );
        return;
      }

      if (peekStreamSlot(embedKey)) {
        requestAnimationFrame(attachActive);
        return;
      }

      const iframe = document.createElement("iframe");
      iframe.src = initialSrc;
      iframe.allow = WIDGET_IFRAME_ALLOW;
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      iframe.addEventListener("load", markFrameLoaded, { once: true });
      stage.appendChild(iframe);
      void stage.offsetHeight;
      wireIframeMetadata(iframe, true, streamPriority, embedPlan, embedKey);
      adoptInCardStreamSlot(embedKey, initialSrc, iframe, false);
      iframeRef.current = iframe;
      setUsingEngineSlot(false);
    };

    attachActive();
  }, [
    embedKey,
    initialSrc,
    embedPlan,
    mountIframe,
    warmInDock,
    isActive,
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
      wireIframeMetadata(iframe, true, streamPriority, embedPlan, embedKey);
      return;
    }
    refreshStreamStageLayout(embedKey, true);
  }, [isActive, mountIframe, streamPriority, embedPlan, embedKey]);

  useEffect(() => {
    if (!isActive) {
      onIframeWindow?.(null);
      return;
    }
    if (!frameLoaded) return;
    onIframeWindow?.(iframeRef.current?.contentWindow ?? null);
  }, [isActive, frameLoaded, onIframeWindow]);

  const rootStyle = feedEmbedRootStyle();
  const posterStyle = feedPosterImageStyle();

  const stageStyle: CSSProperties = {
    ...feedEmbedStageStyle(),
    zIndex: 1,
    opacity: isActive ? 1 : 0,
    visibility: isActive ? "visible" : "hidden",
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
      data-feed-layout-v="13"
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
