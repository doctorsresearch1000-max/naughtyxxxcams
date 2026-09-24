"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FeedPoster } from "@/components/feed/FeedPoster";
import {
  WIDGET_IFRAME_ALLOW,
  WIDGET_IFRAME_SANDBOX,
  buildCamsEmbedUrl,
} from "@/lib/feed/embedFrame";

type LiveEmbedProps = {
  embedKey: string;
  posterUrl: string;
  isActive: boolean;
  isArmed: boolean;
  onIframeWindow?: (win: Window | null) => void;
};

const SETTLE_MS = 280;

export function LiveEmbed({
  embedKey,
  posterUrl,
  isActive,
  isArmed,
  onIframeWindow,
}: LiveEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [frameLoaded, setFrameLoaded] = useState(false);
  const [settled, setSettled] = useState(false);

  const embedSrc = useMemo(
    () =>
      buildCamsEmbedUrl(embedKey, {
        cols: 1,
        rows: 1,
        number: 1,
        ratio: 0.5625,
        useFeed: 0,
      }),
    [embedKey],
  );

  useEffect(() => {
    setFrameLoaded(false);
    setSettled(false);
  }, [embedKey]);

  useEffect(() => {
    if (!isActive || !frameLoaded) {
      setSettled(false);
      return;
    }
    const t = window.setTimeout(() => setSettled(true), SETTLE_MS);
    return () => window.clearTimeout(t);
  }, [isActive, frameLoaded, embedKey]);

  useEffect(() => {
    if (!isActive) {
      onIframeWindow?.(null);
      return;
    }
    if (!frameLoaded) return;
    onIframeWindow?.(iframeRef.current?.contentWindow ?? null);
  }, [isActive, frameLoaded, onIframeWindow]);

  /**
   * Solo la tarjeta activa monta iframe (evita contextos 1×1 que no inicializan media).
   * URL same-origin (/api/embed/cams) en lugar de srcDoc opaco.
   */
  const mountIframe = isActive && isArmed;
  const hidePoster = isActive && frameLoaded && settled;

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
          ref={iframeRef}
          src={embedSrc}
          title={`Live stream ${embedKey}`}
          data-touch-blocked="true"
          className="pointer-events-none absolute inset-0 z-[12] h-full w-full border-0"
          allow={WIDGET_IFRAME_ALLOW}
          sandbox={WIDGET_IFRAME_SANDBOX}
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setFrameLoaded(true)}
        />
      )}

      <FeedPoster
        feedKey={embedKey}
        posterUrl={posterUrl}
        priority={isActive}
        className={`pointer-events-none absolute inset-0 z-[20] h-full w-full object-cover transition-opacity duration-300 ${
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
