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
  /** Identificador estable por tarjeta (no cambia mute/volumen). */
  embedInstanceId?: string;
};

/** URL del script — `muted=1` fijo: sin remount por audio. */
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

  if (options.embedInstanceId) {
    params.set("sub_id", options.embedInstanceId.slice(0, 64));
  }

  return `${WIDGET_SCRIPT_BASE}?${params.toString()}`;
}

const AFFILIATE_GUARD = `
      (function () {
        var isOffSite = function (href) {
          if (!href || href === '#' || href.indexOf('javascript:') === 0) return false;
          try {
            var u = new URL(href, window.location.href);
            return u.origin !== window.location.origin;
          } catch (e) { return true; }
        };
        var block = function (e) {
          var t = e.target;
          if (!t || !t.closest) return;
          var a = t.closest('a[href]');
          if (a && isOffSite(a.getAttribute('href'))) {
            e.preventDefault();
            e.stopPropagation();
          }
        };
        document.addEventListener('click', block, true);
        document.addEventListener('touchend', block, true);
        window.open = function () { return null; };
      })();
`;

const AUDIO_BRIDGE = `
      window.addEventListener('message', function (event) {
        if (!event.data || event.data.source !== 'naughty-feed') return;
        if (event.data.action === 'session-audio-unlock') {
          document.querySelectorAll('video').forEach(function (v) {
            try { v.muted = false; v.volume = 1; v.play().catch(function () {}); } catch (e) {}
          });
        }
        if (event.data.action === 'session-audio-mute') {
          document.querySelectorAll('video').forEach(function (v) {
            try { v.muted = true; } catch (e) {}
          });
        }
      });
`;

export function buildWidgetSrcDoc(
  scriptSrc: string,
  options?: { blockAffiliateNavigation?: boolean },
): string {
  const guard = options?.blockAffiliateNavigation ? AFFILIATE_GUARD : "";

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
      a, a * { pointer-events: none !important; cursor: default !important; }
      iframe, div, object {
        width: 100% !important;
        max-width: 100% !important;
      }
    </style>
  </head>
  <body>
    <script>${AUDIO_BRIDGE}</script>
    <script>${guard}</script>
    <script src="${scriptSrc}"></script>
  </body>
</html>`;
}
