"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  isActive: boolean;
  isArmed: boolean;
  audioUnlocked: boolean;
  isScrolling: boolean;
  posterUrl: string;
  onIframeWindow?: (win: Window | null) => void;
};

const SETTLE_MS = 400;

export function LiveEmbed({
  embedKey,
  isActive,
  isArmed,
  audioUnlocked,
  isScrolling,
  posterUrl,
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
    });
    return buildWidgetSrcDoc(scriptSrc);
    // embedKey: iframe estable por modelo; sin remount por mute/volumen
  }, []);

  useEffect(() => {
    if (!isArmed) {
      setFrameLoaded(false);
      setSettled(false);
    }
  }, [isArmed]);

  useEffect(() => {
    if (!frameLoaded || !isActive) {
      setSettled(false);
      return;
    }
    const t = window.setTimeout(() => setSettled(true), SETTLE_MS);
    return () => window.clearTimeout(t);
  }, [frameLoaded, isActive, embedKey]);

  useEffect(() => {
    if (!isActive) {
      onIframeWindow?.(null);
      return;
    }
    const win = iframeRef.current?.contentWindow ?? null;
    onIframeWindow?.(win);
  }, [isActive, frameLoaded, onIframeWindow]);

  const revealStream = isActive && isArmed;
  const showPoster =
    !revealStream || !settled || !frameLoaded;

  const pointerInteractive =
    isActive && audioUnlocked && !isScrolling && revealStream;

  if (!isArmed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={posterUrl}
        alt=""
        className="absolute inset-0 z-[10] h-full w-full object-cover"
        loading="lazy"
      />
    );
  }

  return (
    <div className="absolute inset-0 z-[10] overflow-hidden bg-black">
      <iframe
        ref={iframeRef}
        key={embedKey}
        srcDoc={srcDoc}
        title={`Live stream ${embedKey}`}
        data-touch-blocked={pointerInteractive ? "false" : "true"}
        className={
          pointerInteractive
            ? "absolute inset-0 h-full w-full border-0"
            : "pointer-events-none absolute inset-0 h-full w-full touch-none border-0"
        }
        style={revealStream ? undefined : parkedIframeStyle}
        onLoad={() => setFrameLoaded(true)}
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={posterUrl}
        alt=""
        className={`pointer-events-none absolute inset-0 z-[20] h-full w-full object-cover transition-opacity duration-300 ${
          showPoster ? "opacity-100" : "opacity-0"
        }`}
        loading={isActive ? "eager" : "lazy"}
      />
    </div>
  );
}
