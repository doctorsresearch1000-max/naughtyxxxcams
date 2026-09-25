import { WIDGET_IFRAME_ALLOW } from "@/lib/feed/embedFrame";

const INNER_IFRAME_ALLOW = WIDGET_IFRAME_ALLOW;

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
      try { v.muted = true; v.volume = 0; } catch (e) {}
    });
  }
  function setInnerFeedAudioParams(unlock) {
    var frame = getWidgetFrame();
    if (!frame) return;
    var raw = frame.getAttribute('src') || frame.src;
    if (!raw) return;
    try {
      var u = new URL(raw, window.location.href);
      u.searchParams.set('volumelevel', unlock ? '1' : '0');
      u.searchParams.set('widescreen', 'true');
      u.searchParams.set('muted', unlock ? '0' : '1');
      u.searchParams.set('volume', unlock ? '1' : '0');
      var next = u.toString();
      if (frame.src !== next) {
        frame.src = next;
      }
    } catch (e) {}
  }
  function forwardToWidget(data) {
    var widgetFrame = getWidgetFrame();
    if (widgetFrame && widgetFrame.contentWindow) {
      try { widgetFrame.contentWindow.postMessage(data, '*'); } catch (e) {}
    }
  }
  function applyUnlock(data) {
    setInnerFeedAudioParams(true);
    unmuteAllVideos();
    forwardToWidget(data);
    try {
      var frame = getWidgetFrame();
      if (frame) frame.style.pointerEvents = 'auto';
    } catch (e) {}
  }
  function applyMute() {
    setInnerFeedAudioParams(false);
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
    if (t.closest('#cr-widget-frame')) return;
    var a = t.closest('a[href]');
    if (a && isOffSite(a.getAttribute('href'))) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }, true);
  window.open = function () { return null; };
})();
`;

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

export type EmbedShellOptions = {
  embedInstanceId: string;
  widgetMuted: number;
  roomAffiliateUrl?: string;
  blockAffiliateNavigation?: boolean;
};

export function buildStreamEmbedSrcDoc(
  innerFrameSrc: string,
  options: EmbedShellOptions,
): string {
  const guard = options.blockAffiliateNavigation ? AFFILIATE_GUARD : "";
  const notifier = buildWidgetLoadNotifierScript(options.embedInstanceId);
  const safeFrameSrc = innerFrameSrc.replace(/"/g, "&quot;");
  const safeRoom = (options.roomAffiliateUrl ?? "")
    .replace(/"/g, "&quot;")
    .replace(/</g, "");

  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta http-equiv="Permissions-Policy" content="autoplay=(self), encrypted-media=(self), microphone=(self), camera=(self), fullscreen=(self)">
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
        z-index: 1;
        pointer-events: auto;
      }
    </style>
  </head>
  <body data-embed-instance="${options.embedInstanceId}" data-widget-muted="${options.widgetMuted}" data-room-url="${safeRoom}">
    <div id="widget-shell">
      <iframe
        id="cr-widget-frame"
        src="${safeFrameSrc}"
        title="Live stream"
        allow="${INNER_IFRAME_ALLOW}"
        referrerpolicy="strict-origin-when-cross-origin"
      ></iframe>
    </div>
    <script>${AUDIO_BRIDGE}</script>
    <script>${guard}</script>
    <script>${notifier}</script>
  </body>
</html>`;
}
