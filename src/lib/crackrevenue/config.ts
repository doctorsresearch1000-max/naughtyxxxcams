/**
 * Variables alineadas con el panel Cloudflare Workers (CRAK_* + CRACKREVENUE_*).
 * En producción OpenNext/Workers inyecta `vars` como process.env.
 */

export const CRAK_TOKEN =
  process.env.CRAK_TOKEN ?? process.env.CRACKREVENUE_TOKEN ?? "";

export const CRAK_API_KEY =
  process.env.CRAK_API_KEY ?? process.env.CRACKREVENUE_API_KEY ?? "";

export const CRAK_BRANDS = process.env.CRAK_BRANDS ?? "";

export const CRAK_LANDING_ID_RAW =
  process.env.CRAK_LANDING_ID ?? process.env.CRACKREVENUE_LANDING_ID ?? "";

export const CRACKREVENUE_USER_AGENT =
  process.env.CRACKREVENUE_USER_AGENT ??
  "NaughtyXxxCams/1.0 (+https://naughtyxxxcams.com)";

export const WIDGET_SCRIPT_BASE =
  process.env.CRACKREVENUE_WIDGET_SCRIPT_URL ??
  "https://widget-ext.crxcr2.com/script";

/** Alias usados por api.ts y rutas legacy */
export const CRACKREVENUE_TOKEN = CRAK_TOKEN;
export const CRACKREVENUE_API_KEY = CRAK_API_KEY;

export const STREAMATE_BRAND = "streamate";

/**
 * El widget suele esperar `landing_id` numérico (ej. 214769).
 * Si CRAK_LANDING_ID es la URL de tracking, extraemos el primer segmento numérico del path.
 */
export function resolveWidgetLandingId(raw: string = CRAK_LANDING_ID_RAW): string {
  const value = raw.trim();
  if (!value) return "{offer_url_id}";
  if (/^\d+$/.test(value)) return value;

  try {
    const url = new URL(value);
    const segment = url.pathname.split("/").find((part) => /^\d+$/.test(part));
    if (segment) return segment;
  } catch {
    /* no es URL */
  }

  return value;
}

export function resolveWidgetBrands(): string {
  const brands = CRAK_BRANDS.trim();
  return brands.length > 0 ? brands : STREAMATE_BRAND;
}

/** Tags documentados en performers-ext (API CrakRevenue). */
export const API_TAG_SLUGS = [
  "anal",
  "athletic",
  "bbw",
  "curvy",
  "dancing",
  "beautiful",
  "black hair",
  "blowjob",
  "bdsm",
  "bondage",
  "deepthroat",
  "dirty talk",
  "big ass",
  "big tits",
  "blond hair",
  "brown hair",
  "dominant",
  "findom",
  "femdom",
  "feet",
  "housewife",
  "kinky",
  "milf",
  "muscular",
  "hairy",
  "masturbation",
  "petite",
  "red hair",
  "skinny",
  "sex toy",
  "squirt",
  "striptease",
  "submissive",
  "tattoos",
] as const;

export const API_ETHNICITY_SLUGS = [
  "caucasian",
  "ebony",
  "hispanic",
  "asian",
  "indian",
  "arab",
  "native american",
] as const;

export const API_AGE_SLUGS = [
  "gc_18_19",
  "gc_20_29",
  "gc_30_39",
  "gc_40_49",
  "gc_50_plus",
] as const;
