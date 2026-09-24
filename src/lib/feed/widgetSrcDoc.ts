import {
  CRACKREVENUE_API_KEY,
  CRACKREVENUE_TOKEN,
  STREAMATE_BRAND,
  WIDGET_SCRIPT_BASE,
} from "@/lib/crackrevenue/config";

export type WidgetEmbedOptions = {
  cols?: number;
  rows?: number;
  number?: number;
  ratio?: number;
  useFeed?: number;
  animateFeed?: number;
  smoothAnimation?: number;
};

/** URL del script — `muted=1` fijo: no remount por audio. */
export function buildWidgetScriptSrc(options: WidgetEmbedOptions = {}): string {
  const params = new URLSearchParams({
    landing_id: "{offer_url_id}",
    genders: "f",
    providers: STREAMATE_BRAND,
    brands: STREAMATE_BRAND,
    skin: "1",
    containerAlignment: "center",
    cols: String(options.cols ?? 1),
    rows: String(options.rows ?? 1),
    number: String(options.number ?? 1),
    background: "transparent",
    useFeed: String(options.useFeed ?? 0),
    animateFeed: String(options.animateFeed ?? 0),
    smoothAnimation: String(options.smoothAnimation ?? 0),
    ratio: String(options.ratio ?? 0.5625),
    verticalSpace: "8px",
    horizontalSpace: "8px",
    colorFilter: "0",
    colorFilterStrength: "0",
    AuxiliaryCSS: "\n",
    lang: "es",
    muted: "1",
    token: CRACKREVENUE_TOKEN,
    api_key: CRACKREVENUE_API_KEY,
  });
  return `${WIDGET_SCRIPT_BASE}?${params.toString()}`;
}

export function buildWidgetSrcDoc(scriptSrc: string): string {
  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html, body {
        width: 100%;
        height: 100%;
        background: #000;
        overflow: hidden;
        touch-action: none;
      }
      iframe, div, object {
        width: 100% !important;
        max-width: 100% !important;
      }
    </style>
  </head>
  <body>
    <script>
      window.addEventListener('message', function (event) {
        if (!event.data || event.data.source !== 'naughty-feed') return;
        if (event.data.action === 'session-audio-unlock') {
          document.querySelectorAll('video').forEach(function (v) {
            try { v.muted = false; v.play().catch(function () {}); } catch (e) {}
          });
        }
      });
    </script>
    <script src="${scriptSrc}"></script>
  </body>
</html>`;
}
