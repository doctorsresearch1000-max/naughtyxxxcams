"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FeedPoster } from "@/components/feed/FeedPoster";
import { useSessionAudio } from "@/components/feed/SessionAudioProvider";
import {
  WIDGET_IFRAME_ALLOW_COMBINED,
  WIDGET_IFRAME_SANDBOX,
  buildCamsEmbedUrl,
} from "@/lib/feed/embedFrame";

type LiveEmbedProps = {
  embedKey: string;
  posterUrl: string;
  performerNameClean?: string;
  isActive: boolean;
  isArmed: boolean;
  onIframeWindow?: (win: Window | null) => void;
};

/** Si el widget no notifica stream, no bloquear el póster indefinidamente. */
const POSTER_FALLBACK_MS = 6_000;

export function LiveEmbed({
  embedKey,
  posterUrl,
  performerNameClean,
  isActive,
  isArmed,
  onIframeWindow,
}: LiveEmbedProps) {
  const { muted, unlocked } = useSessionAudio();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const streamMuted = !unlocked || muted;
  const [frameLoaded, setFrameLoaded] = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  const [posterFallback, setPosterFallback] = useState(false);

  const embedSrc = useMemo(
    () =>
      buildCamsEmbedUrl(embedKey, {
        cols: 1,
        rows: 1,
        number: 1,
        ratio: 0.5625,
        useFeed: 0,
        performerNameClean,
        muted: streamMuted ? 1 : 0,
      }),
    [embedKey, performerNameClean, streamMuted],
  );

  useEffect(() => {
    setFrameLoaded(false);
    setStreamActive(false);
    setPosterFallback(false);
  }, [embedKey, isActive]);

  useEffect(() => {
    if (!isActive || !frameLoaded) return;
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage(
      {
        source: "naughty-feed",
        action: streamMuted ? "session-audio-mute" : "session-audio-unlock",
      },
      "*",
    );
  }, [streamMuted, isActive, frameLoaded, embedSrc]);

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

  const mountIframe = isActive && isArmed;
  const hidePoster =
    isActive && frameLoaded && (streamActive || posterFallback);

  if (!isArmed) {
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
    <div className="absolute inset-0 z-[10] overflow-hidden bg-black">
      {mountIframe && (
        <iframe
          key={`${embedKey}-${streamMuted ? "m" : "a"}`}
          ref={iframeRef}
          src={embedSrc}
          title={`Live stream ${embedKey}`}
          data-touch-blocked="true"
          className="pointer-events-none absolute inset-0 z-[12] h-full w-full border-0"
          allow={WIDGET_IFRAME_ALLOW_COMBINED}
          sandbox={WIDGET_IFRAME_SANDBOX}
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setFrameLoaded(true)}
        />
      )}

      <FeedPoster
        feedKey={embedKey}
        posterUrl={posterUrl}
        priority={isActive}
        className={`pointer-events-none absolute inset-0 z-[20] h-full w-full object-cover transition-opacity duration-500 ${
          hidePoster ? "opacity-0" : "opacity-100"
        }`}
      />

      {mountIframe && (
        <div
          className="pointer-events-none absolute inset-0 z-[25] touch-none"
          aria-hidden
        />
      )}
    </div>
  );
}
