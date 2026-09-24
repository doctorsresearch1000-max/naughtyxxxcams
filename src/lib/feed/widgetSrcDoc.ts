import {
  CRACKREVENUE_API_KEY,
  CRACKREVENUE_TOKEN,
  resolveWidgetBrands,
  resolveWidgetLandingId,
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
  embedInstanceId?: string;
};

export function buildWidgetScriptSrc(options: WidgetEmbedOptions = {}): string {
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
    muted: "1",
    autoplay: "1",
    autoPlay: "1",
    token: CRACKREVENUE_TOKEN,
    api_key: CRACKREVENUE_API_KEY,
  });

  if (options.embedInstanceId) {
    params.set("sub_id", options.embedInstanceId.slice(0, 64));
  }

  return `${WIDGET_SCRIPT_BASE}?${params.toString()}`;
}

function buildStreamNotifierScript(instanceId: string): string {
  const safeInstance = JSON.stringify(instanceId);
  return `
(function () {
  var instance = ${safeInstance};
  var sent = false;
  function notify() {
    if (sent) return;
    sent = true;
    try {
      window.parent.postMessage(
        { source: "naughty-embed", action: "stream-active", instance: instance },
        "*"
      );
    } catch (e) {}
  }
  function probe() {
    var videos = document.querySelectorAll("video");
    for (var i = 0; i < videos.length; i++) {
      var v = videos[i];
      if (v.readyState >= 2 && (v.videoWidth > 0 || v.currentTime > 0)) {
        notify();
        return;
      }
      if (!v.paused && v.currentTime > 0) {
        notify();
        return;
      }
    }
  }
  document.addEventListener(
    "playing",
    function (e) {
      if (e.target && e.target.tagName === "VIDEO") notify();
    },
    true
  );
  document.addEventListener(
    "loadeddata",
    function (e) {
      if (e.target && e.target.tagName === "VIDEO") probe();
    },
    true
  );
  window.addEventListener("load", probe);
  setInterval(probe, 350);
  try {
    new MutationObserver(probe).observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  } catch (e) {}
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

const AUTOPLAY_KICKSTART = `
(function () {
  function kick() {
    document.querySelectorAll('video').forEach(function (v) {
      try {
        v.setAttribute('playsinline', '');
        v.setAttribute('webkit-playsinline', '');
        v.muted = true;
        v.autoplay = true;
        var p = v.play();
        if (p && typeof p.catch === 'function') p.catch(function () {});
      } catch (e) {}
    });
  }
  kick();
  window.addEventListener('load', kick);
  document.addEventListener('DOMContentLoaded', kick);
  try {
    new MutationObserver(kick).observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  } catch (e) {}
  setInterval(kick, 2000);
})();
`;

export function buildWidgetSrcDoc(
  scriptSrc: string,
  options?: {
    blockAffiliateNavigation?: boolean;
    enableAutoplayKickstart?: boolean;
    embedInstanceId?: string;
  },
): string {
  const guard = options?.blockAffiliateNavigation ? AFFILIATE_GUARD : "";
  const kick = options?.enableAutoplayKickstart ? AUTOPLAY_KICKSTART : "";
  const notifier = buildStreamNotifierScript(options?.embedInstanceId ?? "");

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
      #cams-widget-root, iframe, div, object, video {
        width: 100% !important;
        max-width: 100% !important;
        min-height: 100%;
      }
      video {
        object-fit: cover;
      }
    </style>
  </head>
  <body data-embed-instance="${options?.embedInstanceId ?? ""}">
    <div id="cams-widget-root"></div>
    <script>${AUDIO_BRIDGE}</script>
    <script>${guard}</script>
    <script>${notifier}</script>
    <script src="${scriptSrc}"></script>
    <script>${kick}</script>
  </body>
</html>`;
}
