import {
  CRACKREVENUE_API_KEY,
  CRACKREVENUE_TOKEN,
  WIDGET_FRAME_BASE,
  WIDGET_SCRIPT_BASE,
  resolveWidgetBrands,
  resolveWidgetLandingId,
} from "@/lib/crackrevenue/config";

export type WidgetEmbedOptions = {
  cols?: number;
  rows?: number;
  number?: number;
  ratio?: number;
  useFeed?: number;
  animateFeed?: number;
  smoothAnimation?: number;
  embedInstanceId?: string;
  /** Filtra el widget a un modelo concreto (Streamate nameClean). */
  performerNameClean?: string;
  /** 1 = mute (autoplay), 0 = audio tras gesto del usuario */
  muted?: number;
};

function buildWidgetSearchParams(
  options: WidgetEmbedOptions = {},
): URLSearchParams {
  const brands = resolveWidgetBrands();
  const landingId = resolveWidgetLandingId();

  const params = new URLSearchParams({
    landing_id: landingId,
    genders: "f",
    providers: brands,
    brands,
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
    muted: String(options.muted ?? 1),
    autoplay: "1",
    autoPlay: "1",
    token: CRACKREVENUE_TOKEN,
    api_key: CRACKREVENUE_API_KEY,
  });

  const performer = options.performerNameClean?.trim();
  if (performer) {
    params.set("performerNameClean", performer);
  }

  if (options.embedInstanceId) {
    params.set("sub_id", options.embedInstanceId.slice(0, 64));
  }

  return params;
}

/**
 * Loader oficial (`CamsWidgetScript`); inserta un iframe hijo vía `document.currentScript`.
 * En srcDoc anidado suele fallar el sizing (`parentNode.clientWidth === 0`) y el vídeo queda en poster.
 */
export function buildWidgetScriptSrc(options: WidgetEmbedOptions = {}): string {
  const params = buildWidgetSearchParams(options);
  return `${WIDGET_SCRIPT_BASE}?${params.toString()}`;
}

/**
 * Misma carga que aplica el script tras `setHeight`: iframe directo a `widget-ext.crxcr2.com/?…#cols,rows`.
 */
export function buildWidgetFrameSrc(options: WidgetEmbedOptions = {}): string {
  const cols = options.cols ?? 1;
  const rows = options.rows ?? 1;
  const params = buildWidgetSearchParams(options);
  const base = WIDGET_FRAME_BASE.endsWith("/")
    ? WIDGET_FRAME_BASE.slice(0, -1)
    : WIDGET_FRAME_BASE;
  return `${base}/?${params.toString()}#${cols},${rows}`;
}

function buildWidgetLoadNotifierScript(instanceId: string): string {
  const safeInstance = JSON.stringify(instanceId);
  return `
(function () {
  var instance = ${safeInstance};
  var sent = false;
  function notify(reason) {
    if (sent) return;
    sent = true;
    try {
      window.parent.postMessage(
        {
          source: "naughty-embed",
          action: "stream-active",
          instance: instance,
          reason: reason || "widget-ready",
        },
        "*"
      );
    } catch (e) {}
  }
  var iframe = document.getElementById("cr-widget-frame");
  if (iframe) {
    iframe.addEventListener("load", function () {
      notify("widget-iframe-load");
    });
  }
  window.addEventListener("load", function () {
    setTimeout(function () {
      notify("embed-shell-timeout");
    }, 1800);
  });
})();
`;
}

const AFFILIATE_GUARD = `
(function () {
  var isOffSite = function (href) {
    if (!href || href === '#' || href.indexOf('javascript:') === 0) return false;
    try {
      var u = new URL(href, window.location.href);
      return u.host && u.host !== window.location.host;
    } catch (e) { return true; }
  };
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var a = t.closest('a[href]');
    if (a && isOffSite(a.getAttribute('href'))) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }, true);
  window.open = function () { return null; };
})();
`;

const AUDIO_BRIDGE = `
(function () {
  var RETRY_MS = [0, 120, 480];
  function getWidgetFrame() {
    return document.getElementById('cr-widget-frame');
  }
  function unmuteAllVideos() {
    document.querySelectorAll('video').forEach(function (v) {
      try {
        v.muted = false;
        v.volume = 1;
        var p = v.play();
        if (p && typeof p.catch === 'function') p.catch(function () {});
      } catch (e) {}
    });
  }
  function muteAllVideos() {
    document.querySelectorAll('video').forEach(function (v) {
      try { v.muted = true; } catch (e) {}
    });
  }
  function forwardToWidget(data) {
    var widgetFrame = getWidgetFrame();
    if (widgetFrame && widgetFrame.contentWindow) {
      try { widgetFrame.contentWindow.postMessage(data, '*'); } catch (e) {}
    }
  }
  function applyUnlock(data) {
    unmuteAllVideos();
    forwardToWidget(data);
  }
  function applyMute() {
    muteAllVideos();
    forwardToWidget({ source: 'naughty-feed', action: 'session-audio-mute' });
  }
  function scheduleUnlock(data) {
    RETRY_MS.forEach(function (ms) {
      window.setTimeout(function () {
        applyUnlock(data);
      }, ms);
    });
  }
  window.addEventListener('message', function (event) {
    if (!event.data || event.data.source !== 'naughty-feed') return;
    if (event.data.action === 'session-audio-unlock') {
      scheduleUnlock(event.data);
    }
    if (event.data.action === 'session-audio-mute') {
      applyMute();
    }
  });
})();
`;

export function buildWidgetSrcDoc(
  frameSrc: string,
  options?: {
    blockAffiliateNavigation?: boolean;
    embedInstanceId?: string;
    widgetMuted?: number;
  },
): string {
  const guard = options?.blockAffiliateNavigation ? AFFILIATE_GUARD : "";
  const notifier = buildWidgetLoadNotifierScript(
    options?.embedInstanceId ?? "",
  );
  const safeFrameSrc = frameSrc.replace(/"/g, "&quot;");

  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta http-equiv="Permissions-Policy" content="autoplay=(self), encrypted-media=(self)">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html, body {
        width: 100%;
        height: 100%;
        min-height: 100%;
        background: #000;
        overflow: hidden;
      }
      #widget-shell {
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 100vh;
        min-height: 100dvh;
        overflow: hidden;
      }
      #cr-widget-frame {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        border: 0;
        display: block;
      }
    </style>
  </head>
  <body data-embed-instance="${options?.embedInstanceId ?? ""}" data-widget-muted="${options?.widgetMuted ?? 1}">
    <div id="widget-shell">
      <iframe
        id="cr-widget-frame"
        src="${safeFrameSrc}"
        title="CrackRevenue live widget"
        allow="autoplay *; encrypted-media *; fullscreen *; picture-in-picture *"
        referrerpolicy="strict-origin-when-cross-origin"
      ></iframe>
    </div>
    <script>${AUDIO_BRIDGE}</script>
    <script>${guard}</script>
    <script>${notifier}</script>
  </body>
</html>`;
}
