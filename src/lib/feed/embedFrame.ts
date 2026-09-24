import type { WidgetEmbedOptions } from "@/lib/feed/widgetSrcDoc";

/**
 * Permisos delegados al documento del iframe y a iframes anidados del widget.
 * Sin `allow="autoplay; encrypted-media"` el vídeo no arranca (política del navegador).
 */
export const WIDGET_IFRAME_ALLOW =
  "autoplay *; encrypted-media *; fullscreen *; picture-in-picture *";

/**
 * Sandbox mínimo para script del partner + mismo origen en /api/embed/cams.
 * Sin allow-popups en feed para reducir saltos de afiliado (el widget suele anidar su propio frame).
 */
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
