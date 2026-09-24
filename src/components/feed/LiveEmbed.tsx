"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FeedPoster } from "@/components/feed/FeedPoster";
import {
  buildWidgetScriptSrc,
  buildWidgetSrcDoc,
} from "@/lib/feed/widgetSrcDoc";

export const parkedIframeStyle: React.CSSProperties = {
  clipPath: "inset(100%)",
  clip: "rect(0, 0, 0, 0)",
  pointerEvents: "none",
};

type LiveEmbedProps = {
  embedKey: string;
  posterUrl: string;
  isActive: boolean;
  isArmed: boolean;
  /** Tarjeta en viewport y scroll detenido → mostrar stream. */
  isPlaying: boolean;
  onIframeWindow?: (win: Window | null) => void;
};

const SETTLE_MS = 350;

export function LiveEmbed({
  embedKey,
  posterUrl,
  isActive,
  isArmed,
  isPlaying,
  onIframeWindow,
}: LiveEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [frameLoaded, setFrameLoaded] = useState(false);
  const [settled, setSettled] = useState(false);

  const srcDoc = useMemo(() => {
    const scriptSrc = buildWidgetScriptSrc({
      cols: 1,
      rows: 1,
      number: 1,
      ratio: 0.5625,
      useFeed: 0,
      embedInstanceId: embedKey,
    });
    return buildWidgetSrcDoc(scriptSrc, { blockAffiliateNavigation: true });
  }, [embedKey]);

  useEffect(() => {
    if (!isArmed) {
      setFrameLoaded(false);
      setSettled(false);
    }
  }, [isArmed]);

  useEffect(() => {
    if (!frameLoaded || !isPlaying) {
      setSettled(false);
      return;
    }
    const t = window.setTimeout(() => setSettled(true), SETTLE_MS);
    return () => window.clearTimeout(t);
  }, [frameLoaded, isPlaying, embedKey]);

  useEffect(() => {
    if (!isPlaying) {
      onIframeWindow?.(null);
      return;
    }
    const win = iframeRef.current?.contentWindow ?? null;
    onIframeWindow?.(win);
  }, [isPlaying, frameLoaded, onIframeWindow]);

  const mountIframe = isArmed;
  const revealStream = isPlaying && isArmed;
  const hidePoster = revealStream && frameLoaded && settled;

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
          key={embedKey}
          srcDoc={srcDoc}
          title={`Live stream ${embedKey}`}
          data-touch-blocked="true"
          className="pointer-events-none absolute inset-0 h-full w-full touch-none border-0"
          style={revealStream ? undefined : parkedIframeStyle}
          onLoad={() => setFrameLoaded(true)}
          sandbox="allow-scripts allow-same-origin"
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

      {revealStream && (
        <div
          className="pointer-events-none absolute inset-0 z-[25] touch-none"
          aria-hidden
        />
      )}
    </div>
  );
}
