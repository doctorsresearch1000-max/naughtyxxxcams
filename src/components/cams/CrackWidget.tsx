"use client";

import { useMemo, useState } from "react";
import {
  buildWidgetScriptSrc,
  buildWidgetSrcDoc,
} from "@/lib/feed/widgetSrcDoc";
import { STREAMATE_BRAND } from "@/lib/crackrevenue/config";

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
  providers?: string;
  interactive?: boolean;
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
  providers: _providers = STREAMATE_BRAND,
  interactive = true,
}: CrackWidgetProps) {
  const [loaded, setLoaded] = useState(false);

  const srcDoc = useMemo(() => {
    const scriptSrc = buildWidgetScriptSrc({
      cols,
      rows,
      number,
      ratio,
      useFeed,
      animateFeed,
      smoothAnimation,
    });
    return buildWidgetSrcDoc(scriptSrc);
  }, [cols, rows, number, ratio, useFeed, animateFeed, smoothAnimation]);

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
          srcDoc={srcDoc}
          data-touch-blocked={iframeReceivesTouches ? "false" : "true"}
          className={
            iframeReceivesTouches
              ? "pointer-events-auto block h-full w-full max-h-full border-0"
              : "pointer-events-none block h-full w-full max-h-full touch-none border-0"
          }
          onLoad={() => setLoaded(true)}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          title="NaughtyXXX Streamate Feed"
        />
      )}
    </div>
  );
}
