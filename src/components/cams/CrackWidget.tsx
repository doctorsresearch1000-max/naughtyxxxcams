"use client";

import { useEffect, useId, useRef } from "react";

const CRACK_TOKEN = "2c2ecfb0-b7f2-11f1-8697-29ba0a54b9b9";
const CRACK_API_KEY =
  "fdea1df92de2f1f1136fc0f92c35d85ce84c15ad70443277875a1996752c9992";
const CRACK_PROVIDERS =
  "bongacash,cam4,camsoda,imlive,streamate,awempire,stripchat,xlovecam,chaturbate";

const WIDGET_SCRIPT_BASE = "https://www.camiocw.com/script/js.ejs";

export type CrackWidgetProps = {
  cols?: number;
  rows?: number;
  number?: number;
  ratio?: number;
  useFeed?: number;
  animateFeed?: number;
  smoothAnimation?: number;
  className?: string;
};

function buildWidgetScriptUrl({
  cols = 2,
  rows = 2,
  number = 4,
  ratio = 1,
  useFeed = 0,
  animateFeed = 0,
  smoothAnimation = 0,
}: CrackWidgetProps): string {
  const params = new URLSearchParams({
    token: CRACK_TOKEN,
    apikey: CRACK_API_KEY,
    providers: CRACK_PROVIDERS,
    cols: String(cols),
    rows: String(rows),
    number: String(number),
    ratio: String(ratio),
    useFeed: String(useFeed),
    animateFeed: String(animateFeed),
    smoothAnimation: String(smoothAnimation),
    generator: "camswidget",
    referer:
      typeof window !== "undefined"
        ? window.location.hostname
        : "naughtyxxxcams.com",
    background: "transparent",
    showOnline: "true",
  });

  return `${WIDGET_SCRIPT_BASE}?${params.toString()}`;
}

export function CrackWidget({
  cols,
  rows,
  number,
  ratio,
  useFeed,
  animateFeed,
  smoothAnimation,
  className = "",
}: CrackWidgetProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const reactId = useId().replace(/:/g, "");
  const containerId = `crack-widget-${reactId}`;
  const scriptDomId = `crack-widget-script-${reactId}`;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    host.id = containerId;
    host.setAttribute("data-cams-widget", containerId);

    const script = document.createElement("script");
    script.id = scriptDomId;
    script.type = "text/javascript";
    script.async = true;
    script.charset = "utf-8";
    script.src = buildWidgetScriptUrl({
      cols,
      rows,
      number,
      ratio,
      useFeed,
      animateFeed,
      smoothAnimation,
    });
    script.setAttribute("data-crack-widget-host", containerId);

    host.appendChild(script);

    return () => {
      script.remove();
      host.replaceChildren();
    };
  }, [
    cols,
    rows,
    number,
    ratio,
    useFeed,
    animateFeed,
    smoothAnimation,
    containerId,
    scriptDomId,
  ]);

  return (
    <div
      ref={hostRef}
      className={`crack-widget-host w-full min-h-0 ${className}`}
      aria-label="CrakRevenue live cams"
    />
  );
}
