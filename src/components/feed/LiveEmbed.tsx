"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FeedPoster } from "@/components/feed/FeedPoster";
import {
  buildWidgetScriptSrc,
  buildWidgetSrcDoc,
} from "@/lib/feed/widgetSrcDoc";

export const parkedIframeStyle: React.CSSProperties = {
  visibility: "hidden",
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  pointerEvents: "none",
};

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

  const mountIframe = isArmed;
  /** Tarjeta activa: iframe siempre visible (nunca clip/park). Vecinos: preload oculto. */
  const iframeVisible = isActive && isArmed;
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
          srcDoc={srcDoc}
          title={`Live stream ${embedKey}`}
          data-touch-blocked="true"
          className={
            iframeVisible
              ? "pointer-events-none absolute inset-0 z-[12] h-full w-full border-0"
              : "pointer-events-none absolute inset-0 z-[12] h-full w-full touch-none border-0"
          }
          style={iframeVisible ? undefined : parkedIframeStyle}
          onLoad={() => setFrameLoaded(true)}
          sandbox="allow-scripts allow-same-origin"
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

      {iframeVisible && (
        <div
          className="pointer-events-none absolute inset-0 z-[25] touch-none"
          aria-hidden
        />
      )}
    </div>
  );
}
