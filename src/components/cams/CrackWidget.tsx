"use client";

import { useMemo, useState } from "react";
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
  /** Habilita scroll vertical nativo en el contenedor del feed (Home TikTok). */
  enableVerticalScroll?: boolean;
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
  enableVerticalScroll = false,
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
  ]);

  const srcDoc = `
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
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior-y: contain;
            touch-action: pan-y;
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
  `;

  const shellClass = enableVerticalScroll
    ? "touch-pan-y overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]"
    : "overflow-hidden";

  return (
    <div
      className={`relative w-full bg-black ${height} ${shellClass} ${className}`}
    >
      {!loaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black text-zinc-400">
          <div className="mb-3 h-8 w-8 animate-spin rounded-full border-4 border-pink-500 border-t-transparent" />
          <p className="text-xs font-medium">Cargando transmisiones Streamate...</p>
        </div>
      )}
      <iframe
        srcDoc={srcDoc}
        className={`block h-full min-h-full w-full border-0 touch-pan-y ${
          blockPointerEvents ? "pointer-events-none" : "pointer-events-auto"
        }`}
        onLoad={() => setLoaded(true)}
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        title="NaughtyXXX Streamate Feed"
      />
    </div>
  );
}
