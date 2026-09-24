import type { WidgetEmbedOptions } from "@/lib/feed/widgetSrcDoc";

/** Permisos explícitos para autoplay y media en el iframe y frames anidados del widget. */
export const WIDGET_IFRAME_ALLOW =
  "autoplay; encrypted-media; fullscreen; picture-in-picture";

/** Permisos delegados a orígenes del widget (Streamate / popin anidados). */
export const WIDGET_IFRAME_ALLOW_FEATURES =
  "autoplay *; encrypted-media *; fullscreen *; picture-in-picture *";

export const WIDGET_IFRAME_ALLOW_COMBINED = `${WIDGET_IFRAME_ALLOW}; ${WIDGET_IFRAME_ALLOW_FEATURES}`;

export const WIDGET_IFRAME_SANDBOX =
  "allow-scripts allow-same-origin allow-presentation";

export function buildCamsEmbedUrl(
  embedInstanceId: string,
  options?: Omit<WidgetEmbedOptions, "embedInstanceId">,
): string {
  const params = new URLSearchParams({
    instance: embedInstanceId,
    cols: String(options?.cols ?? 1),
    rows: String(options?.rows ?? 1),
    number: String(options?.number ?? 1),
    ratio: String(options?.ratio ?? 0.5625),
    useFeed: String(options?.useFeed ?? 0),
    animateFeed: String(options?.animateFeed ?? 0),
    smoothAnimation: String(options?.smoothAnimation ?? 0),
  });
  return `/api/embed/cams?${params.toString()}`;
}
