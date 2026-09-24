"use client";

import { useMemo, useState } from "react";
import {
  WIDGET_IFRAME_ALLOW_COMBINED,
  WIDGET_IFRAME_SANDBOX,
  buildCamsEmbedUrl,
} from "@/lib/feed/embedFrame";

interface CrackWidgetProps {
  cols?: number;
  rows?: number;
  number?: number;
  ratio?: number;
  useFeed?: number;
  animateFeed?: number;
  smoothAnimation?: number;
  className?: string;
  height?: string;
  blockPointerEvents?: boolean;
  interactive?: boolean;
  embedInstanceId?: string;
}

export default function CrackWidget({
  cols = 1,
  rows = 1,
  number = 10,
  ratio = 0.5625,
  useFeed = 1,
  animateFeed = 1,
  smoothAnimation = 1,
  className = "",
  height = "h-full",
  blockPointerEvents = false,
  interactive = true,
  embedInstanceId = "explore-grid",
}: CrackWidgetProps) {
  const [loaded, setLoaded] = useState(false);

  const embedSrc = useMemo(
    () =>
      buildCamsEmbedUrl(embedInstanceId, {
        cols,
        rows,
        number,
        ratio,
        useFeed,
        animateFeed,
        smoothAnimation,
      }),
    [
      embedInstanceId,
      cols,
      rows,
      number,
      ratio,
      useFeed,
      animateFeed,
      smoothAnimation,
    ],
  );

  const showIframe = !blockPointerEvents;
  const iframeReceivesTouches = interactive && !blockPointerEvents;

  return (
    <div
      className={`relative w-full max-h-full overflow-hidden bg-black ${height} ${className}`}
    >
      {!loaded && showIframe && (
        <div
          className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center bg-black text-zinc-400"
          aria-hidden
        >
          <div className="mb-3 h-8 w-8 animate-spin rounded-full border-4 border-pink-500 border-t-transparent" />
          <p className="text-xs font-medium">Cargando transmisiones Streamate...</p>
        </div>
      )}

      {showIframe && (
        <iframe
          src={embedSrc}
          data-touch-blocked={iframeReceivesTouches ? "false" : "true"}
          className={
            iframeReceivesTouches
              ? "pointer-events-auto block h-full w-full max-h-full border-0"
              : "pointer-events-none block h-full w-full max-h-full touch-none border-0"
          }
          allow={WIDGET_IFRAME_ALLOW_COMBINED}
          sandbox={`${WIDGET_IFRAME_SANDBOX} allow-popups allow-forms`}
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setLoaded(true)}
          title="NaughtyXXX Streamate Feed"
        />
      )}
    </div>
  );
}
