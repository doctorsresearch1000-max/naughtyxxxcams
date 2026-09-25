"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { FeedPoster } from "@/components/feed/FeedPoster";
import { useSessionAudio } from "@/components/feed/SessionAudioProvider";
import type { PerformerEmbedPlan } from "@/lib/feed/performerEmbed";
import {
  postLiveIframeAudio,
  registerActiveFeedAudioTarget,
} from "@/lib/feed/liveIframeAudio";
import {
  WIDGET_IFRAME_ALLOW_COMBINED,
  WIDGET_IFRAME_SANDBOX,
} from "@/lib/feed/embedFrame";

type LiveEmbedProps = {
  embedKey: string;
  posterUrl: string;
  embedPlan: PerformerEmbedPlan;
  isActive: boolean;
  isArmed: boolean;
  onIframeWindow?: (win: Window | null) => void;
};

const POSTER_FALLBACK_MS = 5_000;

export function LiveEmbed({
  embedKey,
  posterUrl,
  embedPlan,
  isActive,
  isArmed,
  onIframeWindow,
}: LiveEmbedProps) {
  const { muted, isAudioUnlocked } = useSessionAudio();
  const cardRootRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const streamMuted = !isAudioUnlocked || muted;
  const [frameLoaded, setFrameLoaded] = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  const [posterFallback, setPosterFallback] = useState(false);

  const embedSrc = embedPlan.outerEmbedSrc;

  const syncActiveAudioTarget = useCallback(() => {
    if (!isActive || !isArmed || !iframeRef.current || !cardRootRef.current) {
      if (!isActive) registerActiveFeedAudioTarget(null);
      return;
    }
    registerActiveFeedAudioTarget({
      iframe: iframeRef.current,
      cardRoot: cardRootRef.current,
      contentWindow: iframeRef.current.contentWindow,
      embedKey,
    });
  }, [isActive, isArmed, embedKey]);

  const bindIframeRef = useCallback(
    (node: HTMLIFrameElement | null) => {
      iframeRef.current = node;
      syncActiveAudioTarget();
    },
    [syncActiveAudioTarget],
  );

  const bindCardRootRef = useCallback(
    (node: HTMLDivElement | null) => {
      cardRootRef.current = node;
      syncActiveAudioTarget();
    },
    [syncActiveAudioTarget],
  );

  useEffect(() => {
    syncActiveAudioTarget();
    return () => {
      if (isActive) registerActiveFeedAudioTarget(null);
    };
  }, [isActive, isArmed, frameLoaded, syncActiveAudioTarget]);

  useEffect(() => {
    setFrameLoaded(false);
    setStreamActive(false);
    setPosterFallback(false);
  }, [embedKey, isActive, embedSrc]);

  useEffect(() => {
    if (!isActive || !frameLoaded) return;

    const fallbackTimer = window.setTimeout(() => {
      setPosterFallback(true);
    }, POSTER_FALLBACK_MS);

    return () => window.clearTimeout(fallbackTimer);
  }, [isActive, frameLoaded, embedKey]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data;
      if (!data || data.source !== "naughty-embed") return;
      if (data.action !== "stream-active") return;
      if (data.instance && data.instance !== embedKey) return;

      const iframeWin = iframeRef.current?.contentWindow;
      if (iframeWin && event.source !== iframeWin) return;

      setStreamActive(true);
      setPosterFallback(true);
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [embedKey]);

  useEffect(() => {
    if (!isActive) {
      onIframeWindow?.(null);
      return;
    }
    if (!frameLoaded) return;
    onIframeWindow?.(iframeRef.current?.contentWindow ?? null);
  }, [isActive, frameLoaded, onIframeWindow]);

  const mountIframe =
    isActive &&
    isArmed &&
    embedPlan.canMountInteractivePlayer &&
    Boolean(embedSrc);

  const streamRevealed =
    isActive && frameLoaded && (streamActive || posterFallback);
  const hidePoster = streamRevealed && mountIframe;
  const allowPlayerInteraction = isAudioUnlocked && !muted;

  useEffect(() => {
    if (!isActive || !frameLoaded || !streamRevealed) return;
    if (!isAudioUnlocked) return;
    postLiveIframeAudio(!streamMuted);
  }, [streamMuted, streamRevealed, isActive, frameLoaded, isAudioUnlocked]);

  if (!isArmed || !embedPlan.canMountInteractivePlayer) {
    return (
      <FeedPoster
        feedKey={embedKey}
        posterUrl={posterUrl}
        priority={isActive}
        className="absolute inset-0 z-[10] h-full w-full object-cover"
      />
    );
  }

  return (
    <div
      ref={bindCardRootRef}
      className="absolute inset-0 z-[10] overflow-hidden bg-black"
      data-feed-card-root="true"
      data-stream-revealed={streamRevealed ? "1" : "0"}
      data-feed-key={embedKey}
      data-embed-mode={embedPlan.mode}
    >
      {mountIframe && embedSrc ? (
        <iframe
          key={`${embedKey}-${embedPlan.mode}`}
          ref={bindIframeRef}
          src={embedSrc}
          title={`Live stream ${embedKey}`}
          data-touch-blocked="true"
          data-naughty-feed-embed="true"
          data-naughty-active-audio={isActive ? "true" : "false"}
          className={`absolute inset-0 z-[12] h-full w-full border-0 ${
            allowPlayerInteraction ? "pointer-events-auto" : "pointer-events-none"
          }`}
          allow={WIDGET_IFRAME_ALLOW_COMBINED}
          sandbox={WIDGET_IFRAME_SANDBOX}
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => {
            setFrameLoaded(true);
            syncActiveAudioTarget();
          }}
        />
      ) : null}

      <FeedPoster
        feedKey={embedKey}
        posterUrl={posterUrl}
        priority={isActive}
        className={`pointer-events-none absolute inset-0 z-[20] h-full w-full object-cover transition-opacity duration-500 ${
          hidePoster ? "opacity-0" : "opacity-100"
        }`}
      />

      {mountIframe && streamMuted ? (
        <div
          className="pointer-events-none absolute inset-0 z-[25] touch-none"
          aria-hidden
        />
      ) : null}
    </div>
  );
}
