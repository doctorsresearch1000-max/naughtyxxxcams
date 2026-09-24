"use client";

import { useMemo, useState } from "react";
import { FeedTouchLayer } from "@/components/feed/FeedTouchLayer";
import {
  CRACKREVENUE_API_KEY,
  CRACKREVENUE_TOKEN,
  STREAMATE_BRAND,
  WIDGET_SCRIPT_BASE,
} from "@/lib/crackrevenue/config";

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
  soundEnabled?: boolean;
  /** Feed home: iframe sin pointer-events + capa de tap para audio. */
  captureScrollGestures?: boolean;
  soundGateOpen?: boolean;
  /** Ventana breve de interacción con el iframe (gesto nativo de sonido). */
  allowIframeInteraction?: boolean;
  onRequestIframeInteraction?: () => void;
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
  providers = STREAMATE_BRAND,
  soundEnabled = false,
  captureScrollGestures = false,
  soundGateOpen = false,
  allowIframeInteraction = false,
  onRequestIframeInteraction,
}: CrackWidgetProps) {
  const [loaded, setLoaded] = useState(false);

  const cleanCols = Number(cols) || 1;
  const cleanRows = Number(rows) || 1;
  const cleanNumber = Number(number) || 10;

  const scriptSrc = useMemo(() => {
    const params = new URLSearchParams({
      landing_id: "{offer_url_id}",
      genders: "f",
      providers,
      brands: STREAMATE_BRAND,
      skin: "1",
      containerAlignment: "center",
      cols: String(cleanCols),
      rows: String(cleanRows),
      number: String(cleanNumber),
      background: "transparent",
      useFeed: String(useFeed),
      animateFeed: String(animateFeed),
      smoothAnimation: String(smoothAnimation),
      ratio: String(ratio),
      verticalSpace: "8px",
      horizontalSpace: "8px",
      colorFilter: "0",
      colorFilterStrength: "0",
      AuxiliaryCSS: "\n",
      lang: "es",
      muted: soundEnabled ? "0" : "1",
      token: CRACKREVENUE_TOKEN,
      api_key: CRACKREVENUE_API_KEY,
    });
    return `${WIDGET_SCRIPT_BASE}?${params.toString()}`;
  }, [
    providers,
    cleanCols,
    cleanRows,
    cleanNumber,
    useFeed,
    animateFeed,
    smoothAnimation,
    ratio,
    soundEnabled,
  ]);

  const srcDoc = useMemo(
    () => `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          html, body {
            width: 100%;
            height: 100%;
            background-color: #000;
            color: #fff;
            overflow: hidden;
            touch-action: none;
            pointer-events: none;
          }
          iframe, div, object {
            width: 100% !important;
            max-width: 100% !important;
          }
        </style>
      </head>
      <body>
        <script src="${scriptSrc}"></script>
      </body>
    </html>
  `,
    [scriptSrc],
  );

  const legacyBlock = blockPointerEvents && !captureScrollGestures;
  const showIframe = !legacyBlock;

  const feedMode = captureScrollGestures;
  const iframeReceivesTouches =
    feedMode ? allowIframeInteraction : !legacyBlock;

  const showTapShield =
    feedMode && !allowIframeInteraction && Boolean(onRequestIframeInteraction);

  return (
    <div
      className={`pointer-events-none relative w-full max-h-full overflow-hidden bg-black ${height} ${className}`}
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

      {legacyBlock && (
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-black"
          aria-hidden
        />
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

      {showTapShield && (
        <FeedTouchLayer
          soundGateOpen={soundGateOpen}
          onExposeIframe={() => onRequestIframeInteraction?.()}
        />
      )}
    </div>
  );
}
