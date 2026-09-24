"use client";

import { useState } from "react";

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
  height = "h-[calc(100vh-64px)]",
}: CrackWidgetProps) {
  const [loaded, setLoaded] = useState(false);

  const srcDoc = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * { box-sizing: border-box; }
          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background-color: #000;
            color: #fff;
            overflow-x: hidden;
            overflow-y: auto;
          }
          iframe, div, object {
            max-width: 100% !important;
          }
        </style>
      </head>
      <body>
        <script src="https://crxcra.com/cams-widget-ext/script?landing_id=%7Boffer_url_id%7D&genders=f&providers=bongacash%2Ccam4%2Ccamsoda%2Cimlive%2Cstreamate%2Cawempire%2Cstripchat%2Cxlovecam%2Cchaturbate&skin=1&containerAlignment=center&cols=${cols}&rows=${rows}&number=${number}&background=transparent&useFeed=${useFeed}&animateFeed=${animateFeed}&smoothAnimation=${smoothAnimation}&ratio=${ratio}&verticalSpace=10px&horizontalSpace=10px&colorFilter=0&colorFilterStrength=0&AuxiliaryCSS=%0A&lang=en&token=2c2ecfb0-b7f2-11f1-8697-29ba0a54b9b9&api_key=fdea1df92de2f1f1136fc0f92c35d85ce84c15ad70443277875a1996752c9992"></script>
      </body>
    </html>
  `;

  return (
    <div
      className={`relative w-full overflow-hidden bg-black ${height} ${className}`}
    >
      {!loaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black text-gray-400">
          <div className="mb-3 h-8 w-8 animate-spin rounded-full border-4 border-pink-500 border-t-transparent" />
          <p className="text-sm font-medium">Cargando transmisores en vivo...</p>
        </div>
      )}
      <iframe
        srcDoc={srcDoc}
        className="block h-full w-full border-0"
        onLoad={() => setLoaded(true)}
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        title="Live Cams Feed"
      />
    </div>
  );
}
