import {
  CRACKREVENUE_API_KEY,
  CRACKREVENUE_TOKEN,
  WIDGET_FRAME_BASE,
  WIDGET_SCRIPT_BASE,
  resolveWidgetBrands,
  resolveWidgetLandingId,
} from "@/lib/crackrevenue/config";
import { buildStreamEmbedSrcDoc } from "@/lib/feed/embedShell";

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
    volumelevel: "0",
    widescreen: "true",
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

export function buildWidgetSrcDoc(
  frameSrc: string,
  options?: {
    blockAffiliateNavigation?: boolean;
    embedInstanceId?: string;
    widgetMuted?: number;
  },
): string {
  return buildStreamEmbedSrcDoc(frameSrc, {
    embedInstanceId: options?.embedInstanceId ?? "",
    widgetMuted: options?.widgetMuted ?? 1,
  });
}
